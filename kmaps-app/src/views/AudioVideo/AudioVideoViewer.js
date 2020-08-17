import React, { useEffect, useState } from 'react';
import { getMandalaAssetDataPromise } from '../../logic/assetapi';
import { Parser } from 'html-to-react';
import { Tabs, Tab } from 'react-bootstrap';
import '../css/AVViewer.css';
import $ from 'jquery';

export function AudioVideoViewer(props) {
    const id = props.id;
    const kmasset = props.mdlasset;
    const sui = props.sui;
    const mapp = 'images';
    useEffect(() => {
        $('body').on('click', 'a.sui-avMore2', function () {
            $('#sui-avlang').toggle();
            this.text = this.text == 'SHOW MORE' ? 'SHOW LESS' : 'SHOW MORE';
        });
        $('#sui-main').addClass('av');
    }, []);

    return (
        <div id={'av-viewer'}>
            <AudioVideoPlayer id={id} asset={kmasset} sui={sui} />
            <AudioVideoMeta id={id} asset={kmasset} sui={sui} />
        </div>
    );
}

function AudioVideoPlayer(props) {
    const kmasset = props.asset;
    const sui = props.sui;
    sui.av.DrawPlayer(kmasset, 'sui-av');
    return <div id={'sui-av'}>Loading ...</div>;
}

function AudioVideoMeta(props) {
    const kmasset = props.asset;
    const sui = props.sui;
    useEffect(() => {
        const mypromise = getMandalaAssetDataPromise('audio_video', props.id);
    }, []);
    sui.av.DrawMetaNew(kmasset, 'meta-details');
    return (
        <div id="av-meta-row">
            <Tabs defaultActiveKey="details" id="av-meta-tabs">
                <Tab eventKey="details" title="DETAILS ">
                    <div id={'meta-details'}>Loading ...</div>
                </Tab>
                <Tab eventKey="related" title="RELATED ">
                    <div id={'meta-mlt'}>Loading ...</div>
                </Tab>
            </Tabs>
        </div>
    );
}
