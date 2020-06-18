import {FeatureGallery} from "./FeatureGallery";
import React, {useState} from "react";
import {useParams, Redirect, useHistory} from "react-router";
import _ from 'lodash';
import {FeatureDeck} from "./FeatureDeck";
import {FeatureList} from "./FeatureList";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";
import ToggleButton from "react-bootstrap/ToggleButton";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";

// There are three view modes encapsulated by three different components
//          gallery:    FeatureGallery
//          list:       FeatureList
//          deck:       FeatureDeck
//
// FeatureCollection decides which view mode to use depending on two different settings
//  1. viewMode property
//  2. viewMode path id
//

const DEFAULT_VIEWMODE = "deck"   //  deck or gallery or list

export function FeatureCollection(props) {
    const params = useParams();
    console.log("FeatureCollection: params: ", params);
    const { viewMode: paramsViewMode } = params;
    const [ viewMode, setViewMode ] = useState(DEFAULT_VIEWMODE);

    // let determine the requested viewMode from props or from params.
    const requestedViewMode = (paramsViewMode)?paramsViewMode:props.viewMode;

    console.log("FeatureCollection: props.viewMode = ", props.viewMode);
    console.log("FeatureCollection: requestedViewMode = ", requestedViewMode);
    console.log("FeatureCollection: paramsViewMode = ", paramsViewMode);


    if (!_.isEmpty(requestedViewMode) && viewMode !== requestedViewMode) {
        setViewMode(requestedViewMode);
    }

    if ( (viewMode && paramsViewMode) && (paramsViewMode !== viewMode)) {
        return <Redirect to={viewMode}/>
    }

    console.log( "FeatureCollection: FINAL VIEWMODE = ", viewMode );

    let viewer = <Redirect to={ DEFAULT_VIEWMODE } />; // by default, let's redirect to the DEFAULT_VIEWMODE url
    switch(viewMode) {
        case "gallery":
            viewer =<FeatureGallery {...props}/>
            break;
        case "deck":
            viewer= <FeatureDeck {...props}/>
            break;
        case "list":
            viewer= <FeatureList {...props}/>
            break;
    }

    return <div>
        <h5>View Mode: <FeatureCollectionViewModeSelector viewMode={viewMode} /></h5>
        {viewer}
    </div>
}

function FeatureCollectionViewModeSelector(props) {

    const history = useHistory();
    const { viewMode } = props;
    const deck = { active: `viewMode === "deck"`};
    const gallery = { active: `viewMode === "gallery"`};
    const list = { active: `viewMode === "list"`};

    function navigate(viewMode) {
        console.log("navigating ", viewMode);
        history.push(viewMode);
    }

    return <ToggleButtonGroup name={viewMode} value={viewMode} type={"radio"} onChange= { (x) => { navigate(x)} }>
        <ToggleButton name={"viewMode"} value={"deck"} type={"radio"}>Card Deck</ToggleButton>
        <ToggleButton name={"viewMode"} value={"gallery"} type={"radio"}>Gallery</ToggleButton>
        <ToggleButton name={"viewMode"} value={"list"} type={"radio"}>List</ToggleButton>
    </ToggleButtonGroup>
}