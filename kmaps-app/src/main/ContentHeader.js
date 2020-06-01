import React from "react";

export function ContentHeader(props) {
    const cheader =
        <div id='sui-header' className={`sui-header legacy ${props.siteClass}`}>
            <div id='sui-contentHead' className='sui-contentHead legacy'>
                <div>
                    <span>{props.kmasset.title}</span>
                    <span>({props.kmasset.uid})</span>
                </div>
            </div>
        </div>;
    return cheader;
}