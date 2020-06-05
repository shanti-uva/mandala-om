import React from 'react';
import {Route, Switch, useRouteMatch} from 'react-router-dom';
import Definitions from './TermsViewer_Definitions';
import TermNames from "./TermsViewer_Names";
import TermAudioPlayer from "./TermsViewer_AudioPlayer";
import RelatedTerms from "./TermsViewer_RelatedTerms";
// import CardGroup from "react-bootstrap/CardGroup";
import 'rc-input-number/assets/index.css';
import NodeHeader from "./common/NodeHeader";
import {FeatureGallery} from "./common/FeatureGallery";

// import KmapContext from "../context/KmapContext";

// Bootstrap

export default function TermsViewer(props) {

    let foo = useRouteMatch();
    let {path, url} = foo;

    console.log("TermsViewer: RouteMatch ", foo);

    let output = <div className={'termsviewer'}>
        Loading...
    </div>;
    if (props.kmasset && props.kmasset.asset_type) {
        output =
            <div className={'termsviewer'}>
                <div className={"sui-terms"}>
                    <NodeHeader kmasset={props.kmasset}/>
                    <Switch>
                        <Route path={`/view/:viewerType/:id/related/:relatedType`}>
                            <FeatureGallery {...props}/>
                        </Route>
                        <Route>
                            <TermNames kmap={props.kmap}/>
                            <TermAudioPlayer kmap={props.kmap}/>
                            <Definitions kmap={props.kmap}/>
                            <RelatedTerms kmap={props.kmap}/>
                        </Route>
                    </Switch>
                </div>
                {/*<pre>{JSON.stringify(props.kmap, undefined, 2)}</pre>*/}
            </div>
    }

    return output;
}

