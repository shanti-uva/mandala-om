import React, { useEffect, useState } from 'react';
import useStatus from '../../hooks/useStatus';
import axios from 'axios';
import jsonpAdapter from '../../logic/axios-jsonp';
import { Tabs, Tab } from 'react-bootstrap';
import './AVViewer.css';
import $ from 'jquery';
import ReactHtmlParser from 'react-html-parser';

/**
 * AudioVideoViewer is called from ContentPane.js and is wrapped in a MdlAssetContext that supplies it with a SOLR
 * record for the AV asset being viewed. It creates a single div#av-viewer inside of the #sui-results div
 *
 * The AudioVideoViewer has two children representing the two rows of the Bootstrap container:
 *      1. AudioVideoPlayer: This component defined below displays the video play and transcript in a single row,
 *      2. AudioVideoMeta: This component also defined below displays a row with the tabbed metadata information for the video.
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export function AudioVideoViewer(props) {
    const id = props.id;
    const kmasset = props.mdlasset;
    const sui = props.sui;
    const status = useStatus();

    // TODO: is this necessary? Are there situations where it's better to hide the extra content? Need to hide if there is no extra content.
    useEffect(() => {
        $('body').on('click', 'a.sui-avMore2', function () {
            $('#sui-avlang').toggle();
            this.text = this.text == 'SHOW MORE' ? 'SHOW LESS' : 'SHOW MORE';
        });
        $('#sui-main').addClass('av');
    }, []);

    useEffect(() => {
        if (props.mdlasset) {
            const mda = props.mdlasset;
            const base_path = process.env.PUBLIC_URL;
            let c = 2;
            let bcrumbs = [
                <a key="bc1" href={base_path + '/audio-video'}>
                    Audio-Video
                </a>,
                <a key="bc2" href={base_path + '/audio-video-collection'}>
                    Collections
                </a>,
            ];
            if (
                mda &&
                mda.collection_title_path_ss &&
                mda.collection_title_path_ss.length > 0
            ) {
                for (
                    var bcn = 0;
                    bcn < mda.collection_title_path_ss.length;
                    bcn++
                ) {
                    c++;
                    const colltitle = mda.collection_title_path_ss[bcn];
                    const collpath =
                        base_path +
                        '/' +
                        mda.collection_uid_path_ss[bcn].replace(
                            'audio-video-collection-',
                            'audio-video-collection/'
                        );
                    let bc = (
                        <a key={'bc' + c} href={collpath}>
                            {colltitle}
                        </a>
                    );
                    bcrumbs.push(bc);
                }
                c++;
                const mytitle =
                    mda.title && mda.title.length > 0
                        ? mda.title[0]
                        : mda.caption;
                let selfbc = (
                    <a key={'bc' + c} className={'self'} name={'selflink'}>
                        {mytitle}
                    </a>
                );
                bcrumbs.push(selfbc);
                status.setSubTitle(bcrumbs);
            }
        }
    }, [props.mdlasset]);
    return (
        <div id={'av-viewer'}>
            <AudioVideoPlayer id={id} asset={kmasset} sui={sui} />
            <AudioVideoMeta id={id} asset={kmasset} sui={sui} />
        </div>
    );
}

/**
 * A simple component to show the AV player and transcript in a row. A function has been added to Bill's legacy code in
 * audiovideo.js called "DrawPlayer" that takes an element ID and draws the player and transcript in that element.
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
function AudioVideoPlayer(props) {
    const kmasset = props.asset;
    const sui = props.sui;
    sui.av.DrawPlayer(kmasset, 'sui-av');
    return <div id={'sui-av'}>Loading ...</div>;
}

/**
 * A component to show two bootstrap tabs for "Details" and "Related". The Details tab is populated by Bill's code audiovideo.js
 * A need function, DrawMetaNew has been added to that code that takes and element ID and draws the combined meta data
 * in that element. Previously Bill had different tabs for different types of metadata, but with the addition of the
 * related tab, these were combined into "Details" as on the Drupal site.
 *
 * The Related tab is populated by an ajax (axios) call to the environment's Drupal Audio Video site, an endpoint for a gallery
 * of thumbnails using a "more like this" solr search in AV's custom solr index. The url is {base}/services/mlt/{nid}.
 * The API has been updated to return json when the parameter 'wt=json' is added. This returns a list of thumbnail divs
 * in HTML markup. Each of these is processed with the AudioVideoMltTile component below
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
function AudioVideoMeta(props) {
    const kmasset = props.asset;
    const sui = props.sui;
    const [mlt, setMlt] = useState([]);
    const url =
        process.env.REACT_APP_DRUPAL_AUDIO_VIDEO +
        '/services/mlt/' +
        kmasset.id +
        '?wt=json';
    // Effect gets the More Like This list
    useEffect(() => {
        axios({
            url:
                process.env.REACT_APP_DRUPAL_AUDIO_VIDEO +
                '/services/mlt/' +
                props.id +
                '?wt=json',
            adapter: jsonpAdapter,
        })
            .then(function (response) {
                setMlt(response.data);
            })
            .catch(function (error) {
                setMlt(['<li>Loading ...</li>']);
            });
    }, [kmasset.id]);
    sui.av.DrawMetaNew(kmasset, 'meta-details');
    return (
        <div id="av-meta-row">
            <Tabs defaultActiveKey="details" id="av-meta-tabs">
                <Tab eventKey="details" title="DETAILS ">
                    <div id={'meta-details'}>Loading ...</div>
                </Tab>
                <Tab eventKey="related" title="RELATED ">
                    <div id={'meta-mlt'}>
                        {mlt.map((tile, n) => {
                            return (
                                <AudioVideoMltTile
                                    key={'avmlt-' + n}
                                    markup={tile}
                                />
                            );
                        })}
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
}

/**
 * A component to process the HTML markup for a tile in the More Like This/Related gallery. It takes the given markup
 * and converts the link to the asset into an internal stand-alone links, e.g. ../audio-video/{nid}. It also removes
 * the link to the collection as there is currently no view for the collection in the stand alone.
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
function AudioVideoMltTile(props) {
    const path = process.env.PUBLIC_URL;
    const mu = props.markup;
    const $mu = $(mu);
    const nid = $mu.data('nid');
    // Replace links to item with an in-standalone link to item
    const stl = $mu.find('a.shanti-thumbnail-link');
    if (stl.length > 0) {
        for (var n = 0; n < stl.length; n++) {
            $mu.find('a.shanti-thumbnail-link')[n].href =
                path + '/audio-video/' + nid;
        }
    }
    if (
        $mu.find('.shanti-field-group-audience a.shanti-thumbnail-link')
            .length > 0
    ) {
        // Remove the link to the collection for now.
        const lnktxt = $mu.find(
            '.shanti-field-group-audience a.shanti-thumbnail-link'
        )[0].text;
        $(
            $mu.find('.shanti-field-group-audience .shanti-field-content')[0]
        ).html(lnktxt);
    }
    const options = { decodeEntities: true };
    return (
        <div className={'shanti-thumbnail'}>
            {ReactHtmlParser($mu.html(), options)}
        </div>
    );
}
