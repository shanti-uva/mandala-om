import React, { useState } from 'react';
import { Parser } from 'html-to-react';
import './css/AVViewer.css';
import $ from 'jquery';

export function AudioVideoViewer(props) {
    const id = props.id;
    const kmasset = props.mdlasset;
    const sui = props.sui;

    if (kmasset) {
        sui.pages.Draw(kmasset, false);
    }

    // TODO: markup issues
    const parser = new Parser();
    // console.dir(sui.pages.div.html());
    const output = parser.parse($(sui.pages.div).html());
    return <div>{output}</div>;
}
