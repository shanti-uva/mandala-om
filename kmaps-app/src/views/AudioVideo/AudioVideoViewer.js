import React, { useEffect, useState } from 'react';
import { Parser } from 'html-to-react';
import '../css/AVViewer.css';
import $ from 'jquery';

export function AudioVideoViewer(props) {
    const id = props.id;
    const kmasset = props.mdlasset;
    const sui = props.sui;
    const inline = props.inline;
    console.log('in av viewer...');
    {
        /*
    if (kmasset) {
        sui.pages.Draw(kmasset, false);
    }

    const parser = new Parser();
    const output = parser.parse($(sui.pages.div).html());
    */
    }

    useEffect(() => {
        $('body').on('click', 'a.sui-avMore2', function () {
            $('#sui-avlang').toggle();
            this.text = this.text == 'SHOW MORE' ? 'SHOW LESS' : 'SHOW MORE';
        });
    }, []);

    return (
        <div id={'av-viewer'}>
            <AudioVideoPlayer id={id} asset={kmasset} sui={sui} />
            <AudioVideoMeta id={id} asset={kmasset} sui={sui} />
        </div>
    );
}

function AudioVideoPlayer(props) {
    const id = props.id;
    const kmasset = props.asset;
    const sui = props.sui;
    sui.av.DrawPlayer(kmasset, 'sui-av');
    return <div id={'sui-av'}>Loading ...</div>;
}

function AudioVideoMeta(props) {
    const id = props.id;
    const kmasset = props.asset;
    const sui = props.sui;
    sui.av.DrawMetaNew(kmasset, 'meta-details');
    return (
        <div className={'av-meta-row'}>
            <div id={'meta-details'}></div>
            <div id={'meta-mlt'}>MLT DATA</div>
        </div>
    );
}
