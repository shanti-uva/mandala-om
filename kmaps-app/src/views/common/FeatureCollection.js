import {FeatureGallery} from "./FeatureGallery";
import React from "react";
import { useParams } from "react-router";


// There are three view modes encapsulated by three different components
//          gallery:    FeatureGallery
//          list:       FeatureList
//          deck:       FeatureDeck
//
// FeatureCollection decides which view mode to use depending on two different settings
//  1. viewMode property
//  2. viewMode path id
//

const DEFAULT_VIEW = "deck"   //  deck or gallery or list

export function FeatureCollection(props) {
    const params = useParams();
    const viewMode = ((props.viewMode)?props.viewMode:params.viewMode)||DEFAULT_VIEW;
    return <FeatureGallery {...props}/>

}