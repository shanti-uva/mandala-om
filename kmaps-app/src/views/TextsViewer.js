import React, {useEffect, useState} from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import TextBody from "./TextsViewer_TextBody";
import TextTabs from "./TextsViewer_TextTabs";
import './css/AssetViewer.css';
import './css/TextViewer.css';
import './css/ShantiTexts.css';
import Spinner from 'react-bootstrap/Spinner'

export function TextsViewer(props) {
    //console.log("TV Props", props);
    let output = <div className={'astviewer'}>
            <Spinner
                as="div"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true">
            </Spinner>
            Loading text...
        </div>;
    if (props.mdlasset && props.mdlasset.nid) {
        const currast = props.mdlasset;
        output =
            <Container className={'astviewer texts'} fluid>
                <Row id={'shanti-texts-container'}>
                    <TextBody markup={currast.full_markup}/>
                    <TextTabs toc={currast.toc_links}
                              meta={currast.bibl_summary}
                              links={currast.views_links} />
                </Row>
            </Container>;
    }
    return output;
}


/* Useful imports to possibly use down the chain
import { useParams } from "react-router-dom";
import axios from 'axios';
import {Parser} from "html-to-react";
import ReactDOMServer from 'react-dom/server';

 */

/* yuji's example code
export function TextsViewer(props) {
    // This has been passed props from <KmapContext> which currently wraps it
    const kmap = props.kmaps;
    const kmasset = props.kmasset;


    let output = [ <div>I am TextViewer, hear me roar.</div> ];
    output.push(<div>I have been passed the properties: <pre>{ JSON.stringify(props, undefined, 2)} </pre></div>);


    return output;

}
*/