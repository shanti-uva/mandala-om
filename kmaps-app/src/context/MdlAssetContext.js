import React, {useState} from 'react';
import {useParams} from "react-router";
import { getMandalaAssetDataPromise } from "../logic/assetapi";
// import _ from 'lodash';

/**
 *    Container which injects the Mandala asset data, before rendering it.
 *    It injects the props:
 *          id: The integer part of the asset's ID
 *          asset_type: The name of the asset app, e.g. texts, visuals, etc. (necessary to make the api call)
 *          mdlasset:  The current ASSET data in json from Mandala
 *
 *    Uses function getMandalaAssetDataPromise(asset_type, id) to build the JSON call and get the data, which
 *    it then "injects" into the children, the apps particular component, by cloning it with the prop information.
 *    When a new app is added the JSON API call must be added to getMandalaAssetDataPromise for that particular
 *    asset type.
 *
 *    This is evoked within the ContentPane.js and should wrap the component of the Mandala App in question
 *    As for instance was done for texts:
 *           <MdlAssetContext assettype={'texts'}>
 *               <TextsViewer onStateChange={props.onStateChange}/>
 *           </MdlAssetContext>
 *
 * */
export default function MdlAssetContext(props) {
    //console.log('props in mdlasset', props);
    const [asset_type, setAssetType] = useState(props.assettype);
    const [mdlasset, setMdlAsset] = useState({});

    const params = useParams();
    const id = params.id.split('-').pop();
    // setMdlAssetId(app + "-" + id);

    if (!props.children) {
        let output = <h2>No Children?</h2>;
        return output;
    } else {

        let changed = false;

        // console.log(asset_type)
        const promises = [getMandalaAssetDataPromise(asset_type, id)];
        console.log(promises);
        Promise.allSettled(promises).then(([mdlasset_result]) => {
            console.log('settled');
            const {status: call_status, value: new_mdlasset} = mdlasset_result;
            if (mdlasset_result && call_status === 'fulfilled' && mdlasset.nid !== new_mdlasset.nid) {
                console.log('Fulfilled!');
                // kmprops.kmasset = new_kmasset; // what is kmprops for?
                setMdlAsset(new_mdlasset);
                changed = true;
            }

            if (changed && props.onStateChange) {
                props.onStateChange({id: id, asset_type: asset_type, mdlasset: mdlasset});
            }
        }).catch(e => {
            console.error("oh dear! failure!??? ", e)
        });
    }

    const ret_children = React.Children.map(props.children, (child) => {
        if (child.type) {
            const new_child = React.cloneElement(child, {
                id: id,
                asset_type: asset_type,
                mdlasset: mdlasset
            });
            return new_child;
        } else {
            return child;
        }
    });
    return ret_children;
}