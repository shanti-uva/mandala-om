import React from "react";
import {FeatureGallery} from "./common/FeatureGallery";
import {FeatureCollection} from "./common/FeatureCollection";

export function SearchViewer (props) {
    let output = <FeatureCollection {...props} viewMode={"deck"} />;
    return <>SEARCH IS GROOVY { output }</>
}