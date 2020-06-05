import React from "react";
import {ContentHeader} from "./ContentHeader";
import {Switch, Route, useRouteMatch} from "react-router-dom";
import {AudioVideoViewer} from "../views/AudioVideoViewer";
import {ImagesViewer} from "../views/ImagesViewer";
import {TextsViewer} from "../views/TextsViewer";
import {SourcesViewer} from "../views/SourcesViewer";
import {VisualsViewer} from "../views/VisualsViewer";
import {PlacesViewer} from "../views/PlacesViewer";
import {SubjectsViewer} from "../views/SubjectsViewer";
import {RelatedsViewer} from "../views/RelatedsViewer";
import LegacyViewer from "../views/LegacyViewer";
import TermsViewer from "../views/TermsViewer";
import {CollectionsViewer} from "../views/CollectionsViewer";
import {Error404} from "../App";
import KmapContext from "../context/KmapContext";

export function ContentPane(props) {

    let {path, url} = useRouteMatch();
    const title = props.title || "Untitled";
    const siteClass = props.site || "defauit";
    const left =
        <div id='sui-content' className='sui-content'>
            <ContentHeader siteClass={siteClass} title={title} sui={props.sui} kmasset={props.kmasset}/>
            <div id={"sui-results"}>
                <Switch>
                    <Route path={`${path}/audio-video/:id`}>
                        <AudioVideoViewer id={props.id} sui={props.sui} onStateChange={props.onStateChange}/>
                    </Route>
                    <Route path={`${path}/images/:id`}>
                        <ImagesViewer id={props.id} sui={props.sui} onStateChange={props.onStateChange}/>
                    </Route>
                    <Route path={`${path}/texts/:id`}>
                        <TextsViewer id={props.id} sui={props.sui} onStateChange={props.onStateChange}/>
                    </Route>
                    <Route path={`${path}/sources/:id`}>
                        <SourcesViewer id={props.id} sui={props.sui} onStateChange={props.onStateChange}/>
                    </Route>
                    <Route path={`${path}/visuals/:id`}>
                        <VisualsViewer id={props.id} sui={props.sui} onStateChange={props.onStateChange}/>
                    </Route>
                    <Route path={`${path}/places/:id`}>
                        <PlacesViewer id={props.id} sui={props.sui} onStateChange={props.onStateChange}/>
                    </Route>
                    <Route path={`${path}/subjects/:id`}>
                        <SubjectsViewer id={props.id} sui={props.sui} onStateChange={props.onStateChange}/>
                    </Route>
                    <Route path={`${path}/assets/:id`}>
                        <RelatedsViewer id={props.id} sui={props.sui} onStateChange={props.onStateChange}/>
                        <LegacyViewer id={props.id} sui={props.sui} onStateChange={props.onStateChange}/>
                    </Route>
                    <Route path={[`${path}/terms/:id/related/:relatedType`,`${path}/terms/:id`]}>
                        <KmapContext sui={props.sui}>
                            <RelatedsViewer id={props.id} sui={props.sui} onStateChange={props.onStateChange}/>
                            <TermsViewer onStateChange={props.onStateChange}/>
                        </KmapContext>
                    </Route>
                    <Route path={`${path}/collections/:id`}>
                        <CollectionsViewer id={props.id} sui={props.sui} onStateChange={props.onStateChange}/>
                    </Route>
                    <Route path="*">
                        <Error404/>
                    </Route>
                </Switch>
            </div>
        </div>;
    return left;
}