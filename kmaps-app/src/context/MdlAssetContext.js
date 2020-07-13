import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import {
    getMandalaAssetDataPromise,
    getLegacyAssetPromise,
} from '../logic/assetapi';
import { normalizeLinks } from '../views/common/utils';
import '../views/css/AssetViewer.css';

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
    // TODO: need to make env determined according to url
    const env = 'dev'; // Acquia Drupal Environment to Call for the JSON API. Set to promises.
    const [asset_type, setAssetType] = useState(props.assettype);
    const [mdlasset, setMdlAsset] = useState({});

    /**
     * Effect used to normalize links in Asset Pages after loading so that links do not go outside of standalon
     * function found in ../common/utils.js
     */
    useEffect(() => {
        normalizeLinks(asset_type);
    });

    const params = useParams();
    let id = params.id; // When ID param is just a number
    if (id.indexOf('-') > 1) {
        // When ID param is something like "texts-1234".
        id = id.split('-').pop();
    }

    if (!props.children) {
        let output = <h2>No Children?</h2>;
        return output;
    } else {
        let changed = false;
        // console.log(asset_type)
        let promises = [];
        // console.log("asset type: " + asset_type);
        if (asset_type == 'texts') {
            promises = [getMandalaAssetDataPromise(env, asset_type, id)];
        } else if (asset_type == 'audio-video') {
            promises = [getLegacyAssetPromise(env, asset_type, id)];
        }
        Promise.allSettled(promises)
            .then(([mdlasset_result]) => {
                const {
                    status: call_status,
                    value: new_mdlasset,
                } = mdlasset_result;
                if (call_status === 'fulfilled') {
                    if (mdlasset_result) {
                        if (mdlasset.nid !== new_mdlasset.nid) {
                            // kmprops.kmasset = new_kmasset; // what is kmprops for?
                            setMdlAsset(new_mdlasset);
                            changed = true;
                        } else if (mdlasset.id !== new_mdlasset.id) {
                            console.warn(
                                'Setting mdl for AV asset',
                                new_mdlasset
                            );
                            setMdlAsset(new_mdlasset);
                            changed = true;
                        }
                    }
                } else if (call_status == 'rejected') {
                    setMdlAsset(false);
                    changed = true;
                }

                if (changed && props.onStateChange) {
                    props.onStateChange({
                        id: id,
                        asset_type: asset_type,
                        mdlasset: mdlasset,
                    });
                }
            })
            .catch((e) => {
                console.error('oh dear! failure!??? ', e);
            });
    }

    const ret_children = React.Children.map(props.children, (child) => {
        if (child.type) {
            const new_child = React.cloneElement(child, {
                id: id,
                asset_type: asset_type,
                mdlasset: mdlasset,
            });
            return new_child;
        } else {
            return child;
        }
    });
    return ret_children;
}
