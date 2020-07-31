import React, { useEffect, useState } from 'react';
import ReactHtmlParser, { convertNodeToElement } from 'react-html-parser';
import { MandalaPopover } from './MandalaPopover';
import { MandalaModal } from './MandalaModal';
import { useSolr, useSolrEnabled } from '../../hooks/useSolr';

/**
 * The transform function sent to ReactHtmlParse for converting raw HTML into React Components
 * Used to:
 *    1) convert old popover html to MandalaPopover component and
 *    2) ferret out links in the HTML and if they are internal to mandala convert them to
 *       properly pathed internal links in same window using MandalaLink and MandalaPathDecoder
 *       or if external, either display in modal if the site permits it (using MandalaModal)
 *       or, if not, then opens in a new window with target attribute.
 *
 * @param node
 * @param index
 */
function transform(node, index) {
    // Process Popover Links in Mandala Markup
    if (node.attribs && node.attribs['class'] === 'kmap-tag-group') {
        const kmpdom = node.attribs['data-kmdomain'];
        const kmpid = node.attribs['data-kmid'];
        return <MandalaPopover domain={kmpdom} kid={kmpid} />;
    } // Process External Links in Mandala Markup to turn into Modals or Internal links TODO: Process internal Mandala links
    else if (
        node.name &&
        node.name === 'a' &&
        node.attribs &&
        node.attribs['href']
    ) {
        let linkurl = node.attribs['href'];
        let mandalaid =
            typeof node.attribs['data-mandala-id'] === 'undefined'
                ? false
                : node.attribs['data-mandala-id'];

        let linkcontents = [];
        for (let n in node.children) {
            linkcontents.push(
                convertNodeToElement(node.children[n], index, transform)
            );
        }
        let mytitle = node.attribs['title'] ? node.attribs['title'] : false;
        if (mytitle === false) {
            mytitle =
                typeof linkcontents[0] === 'string'
                    ? linkcontents[0].split(':')[0]
                    : 'No title';
        }
        const blocked = isBlockedUrl(linkurl);

        if (linkurl === '#') {
            return;
        } else if (mandalaid) {
            return <MandalaLink mid={mandalaid} contents={linkcontents} />;
        } else if (
            !linkurl.includes('https://mandala') &&
            (linkurl[0] === '/' || linkurl.includes('shanti.virginia.edu'))
        ) {
            const path = linkurl.replace(/https?\:\/\//, '').split('?')[0];
            let pathparts = path.split('/');
            const domain = pathparts[0].includes('.shanti.virginia')
                ? pathparts.shift()
                : false;
            const mtch =
                domain && typeof domain == 'string'
                    ? domain.match(/(audio-video|images|sources|texts|visuals)/)
                    : false;
            // if only one part to the path, it's most likely not a resource but a Drupal page/view so must use modal
            // or if a mandala app name is not in domain.
            if (pathparts.length == 1 || !mtch) {
                return (
                    <MandalaModal
                        url={linkurl}
                        title={mytitle}
                        text={linkcontents}
                    />
                );
            }
            const app = mtch[0];
            const asset_path = pathparts.join('/');
            return (
                <MandalaPathDecoder
                    mpath={asset_path}
                    url={linkurl}
                    title={mytitle}
                    contents={linkcontents}
                />
            );
        } else if (blocked) {
            return (
                <a href={linkurl} target={'_blank'}>
                    {linkcontents}
                </a>
            );
        } else if (linkurl.search(/(subjects|places|terms)\/\d+/) == -1) {
            // Don't process links in popovers
            return (
                <MandalaModal
                    url={linkurl}
                    title={mytitle}
                    text={linkcontents}
                />
            );
        }
    }
}

/**
 * a function that determines which urls are allowed to show in modal windows instead of new window
 *
 * @param lnkurl
 * @returns {boolean} : returns true if blocked from showing in modal
 */
function isBlockedUrl(lnkurl) {
    // ToDo: Check if there's a way to ping a url to see if it allows Iframing?
    // List of allowed domains for modal popups
    const allowed = ['.virginia.edu', 'youtube.com', 'vimeo.com'];
    for (let n in allowed) {
        let domstr = allowed[n];
        if (lnkurl.includes(domstr)) {
            return false;
        }
    }
    return true;
}

/**
 * Custom function to converts HTML from a Mandala App API into React Component using the MandalaPopover component for Popovers
 *
 * @param props
 * @returns {*}
 * @constructor
 */
export function HtmlWithPopovers(props) {
    const htmlInput = props.markup ? props.markup : '<div></div>';
    const options = {
        decodeEntities: true,
        transform,
    };

    return <>{ReactHtmlParser(htmlInput, options)}</>;
}

function MandalaLink(props) {
    const mid = props.mid;
    const children = props.contents;
    let newurl = process.env.PUBLIC_URL + '/';
    if (mid.includes('-collection-')) {
        newurl += mid.replace('-collection-', '-collection/');
    } else {
        newurl += mid.replace(/\-/g, '/').replace('audio/video', 'audio-video');
    }
    return (
        <a href={newurl} data-mandala-id={mid}>
            {children}
        </a>
    );
}

/**
 * Functional Component for in-Mandala links attempt to search for alias in SOLR and if found
 * returns a link within react to app/id.
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
function MandalaPathDecoder(props) {
    const asset_path = props.mpath;
    const qobj = {
        index: 'assets',
        params: {
            q: 'url_html:"' + asset_path + '"',
            fl: 'asset_type,id',
        },
    };
    const asset = useSolr(asset_path, qobj);
    if (asset && asset.docs && asset.docs.length > 0) {
        const { asset_type, id } = asset.docs[0];
        if (asset_type && id) {
            const newpath =
                process.env.PUBLIC_URL + '/' + asset_type + '/' + id;
            return (
                <a
                    href={newpath}
                    title={props.title}
                    data-original-url={props.url}
                >
                    {props.contents}
                </a>
            );
        }
    }
    return (
        <MandalaModal
            url={props.url}
            title={props.title}
            text={props.contents}
        />
    );
}

export function getRandomKey(txt) {
    const suff = txt ? txt : Math.floor(Math.random() * 10 ** 15).toString(16);
    return Math.floor(Math.random() * 10 ** 15).toString(16) + suff;
}
