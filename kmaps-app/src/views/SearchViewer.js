import React from "react";
import {FeatureGallery} from "./common/FeatureGallery";

export function SearchViewer (props) {
    let output = <FeatureGallery { ...props } />;

    return <>SEARCH IS GROOVY { output }</>
}