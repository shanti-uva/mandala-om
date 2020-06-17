import React, {useState} from 'react';
import {useParams} from "react-router";
import { getMandalaAssetDataPromise } from "../logic/assetapi";
// import _ from 'lodash';

/**
 *    Container which injects the Mandala asset data, before rendering the its children.
 *      TODO: Fix these notes!
 *    It injects the props:
 *
 *          asset_type:   The asset’s UID in the form of [app]-[number], e.g. texts-1234
 *          mdlasset:  The current ASSET data in json from Mandala
 *
 *          NB:  This will ONLY inject into top-level children.  It is fully expected for these top-level components to manage
 *          passing its props to its children as needed.
 *
 *
 * */
export default function MdlAssetContext(props) {
    //console.log('props in mdlasset', props);
    const env = 'local';
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

        Promise.allSettled(promises).then(([mdlasset_result]) => {
            const {status: call_status, value: new_mdlasset} = mdlasset_result;
            if (mdlasset_result && call_status === 'fulfilled' && mdlasset.nid !== new_mdlasset.nid) {
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