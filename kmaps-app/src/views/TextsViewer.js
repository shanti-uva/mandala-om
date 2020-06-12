import React from 'react';

export function TextsViewer(props) {
    // This has been passed props from <KmapContext> which currently wraps it
    const kmap = props.kmaps;
    const kmasset = props.kmasset;


    let output = [ <div>I am TextViewer, hear me roar.</div> ];
    output.push(<div>I have been passed the properties: <pre>{ JSON.stringify(props, undefined, 2)} </pre></div>);


    return output

}