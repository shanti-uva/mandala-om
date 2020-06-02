import React from 'react';
// import {Link, withRouter} from 'react-router-dom';
import Definitions from './TermsViewer_Definitions';
import TermNames from "./TermsViewer_Names";
import TermAudioPlayer from "./TermsViewer_AudioPlayer";
import RelatedTerms from "./TermsViewer_RelatedTerms";
// import KmapContext from "../context/KmapContext";

import {buildNestedDocs} from "./common/utils";
import NodeHeader from "./common/NodeHeader";

// Bootstrap

export default function TermsViewer (props) {

        let output = <div className={'termsviewer'}>
            Loading...
        </div>;

        console.log("TermsViewer: Render(): props = ", props);

        if (props.kmasset && props.kmasset.asset_type) {
            output =
                <div className={'termsviewer'}>
                    <div className={"sui-terms"}>
                        <NodeHeader kmasset={props.kmasset}/>
                        <TermNames kmap={props.kmap}/>
                        <TermAudioPlayer kmap={props.kmap}/>
                        <Definitions kmap={props.kmap}/>
                        <RelatedTerms kmap={props.kmap}/>
                    </div>
                    {/*<pre>{JSON.stringify(props.kmap, undefined, 2)}</pre>*/}
                </div>
            ;
        }

        return output;
}
