import React from "react";
import {FeatureCollection} from "./common/FeatureCollection";

export function SearchViewer (props) {
    let output = <FeatureCollection {...props} viewMode={"deck"} />;
    return <><h2>SEARCH IS GROOVY</h2> { output }</>
}