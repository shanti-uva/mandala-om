import React, {useEffect, useState} from 'react';
import { useParams } from "react-router-dom";
import axios from 'axios';
import {Parser} from "html-to-react";
import ReactDOMServer from 'react-dom/server';

export function TextsViewer(props) {
    let myprms = useParams();
    const env = 'local';
    let host = '';
    switch(env) {
        case "local":
            host = 'https://texts.dd:8443';
            break;
        case "dev":
            host = 'https://texts-dev.shanti.virginia.edu';
            break;
        case "stage":
            host = 'https://texts-stage.shanti.virginia.edu';
            break;
        default:
            host = 'https://texts.shanti.virginia.edu';
    }
    const tid = myprms['id'].split('-').pop();
    const embed_call = host + "/shanti_texts/node_embed/" + tid;
    //const [myhtml, setHTML] = useState({ myhtml: '' });
    const [mybody, setBody] = useState({ mybody: '' });

    useEffect(() => {
        async function fetchData()
        {
            const response = await axios(embed_call);
            const mydata = response.data;
            //setHTML(mydata);
            const parser = new Parser();
            const acomp = parser.parse(mydata);
            let bodychild = (acomp.props.children.length > 1) ? acomp.props.children[1] : false;
            // console.log(acomp.props.children);
            console.log("body child", bodychild);
            setBody(bodychild);
        }
        fetchData();
    }, ['text1']);
/*
    function createMarkup(customhtml) {
        return {__html: customhtml };
    }
        //<div dangerouslySetInnerHTML={ createMarkup(myhtml) } />

 */
    console.log('mybody', mybody);
    return (
        <div>
            <h1>My New result</h1>
            <TextBody elem={ mybody.mybody } />
        </div>
    );

    /*
    return (
        <div>
            <h1>My Comp result</h1>
            {{ mycomp }}
        </div>
    ); */
}

function TextBody(props) {
    console.log("text body props", props);
    const body_html = (props.elem) ? ReactDOMServer.renderToStaticMarkup(props.elem) : '';
    console.log(body_html);
    return (
        <div>
            <p>I am the text's body</p>
            { body_html }
        </div>
    );
}

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