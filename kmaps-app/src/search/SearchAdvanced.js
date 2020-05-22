import {useSelector} from "react-redux";
import {selectQuery} from "../features/kmsearch/kmsearchSlice";
import {FacetBox} from "./FacetBox";
import React from "react";

export function SearchAdvanced(props) {
    const query = useSelector(selectQuery);
    console.log("SearchAdvanced: query = ", query);
    const openclass = props.advanced ? "open" : "closed";
    const advanced =
        <div id='sui-adv' className={`sui-adv ${openclass}`}>

            <FacetBox id='squawk' label="item type" assetType="assets" filters={query.assets}/>
            <FacetBox id='squawk' label="audio-video" assetType="audio-video"/>
            <FacetBox id='squawk' label="images" assetType="images"/>
            <FacetBox id='squawk' label="texts" assetType="texts"/>
            <FacetBox id='squawk' label="images" assetType="images"/>
            <FacetBox id='squawk' label="sources" assetType="sources"/>
            <FacetBox id='squawk' label="visual" assetType="visuals"/>
            <FacetBox id='squawk' label="subjects" assetType="subjects"/>
            <FacetBox id='squawk' label="places" assetType="places"/>
            <FacetBox id='squawk' label="texts" assetType="texts"/>
            <FacetBox id='squawk' label="collections" assetType="collections"/>
            <FacetBox id='squawk' label="languages" assetType="languages"/>

            <FacetBox id='squawk' label="users" assetType="users"/>
            <FacetBox id='squawk' label="languages" assetType="languages"/>

            <FacetBox id='squawk' label="recent searches" assetType="recent-searches"/>

            <div style={{"marginTop": '14px', float: 'right', "fontSize": '13px'}}>
                <div>Show Boolean Controls? &nbsp;<input type='checkbox' id='sui-showBool'
                                                         defaultChecked={'checked'}></input></div>
            </div>
            <div id='sui-footer' className='sui-footer'></div>
        </div>;
    return advanced;
}