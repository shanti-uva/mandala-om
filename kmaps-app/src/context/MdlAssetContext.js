import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import {
    getMandalaAssetDataPromise,
    getLegacyAssetPromise,
} from '../logic/assetapi';
// import { normalizeLinks } from '../views/common/utils';
import '../views/css/AssetViewer.css';
import useStatus from '../hooks/useStatus';

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
 *    This is evoked within the ContentMain.js and should wrap the component of the Mandala App in question
 *    As for instance was done for texts:
 *           <MdlAssetContext assettype={'texts'}>
 *               <TextsViewer />
 *           </MdlAssetContext>
 *
 * */
export default function MdlAssetContext(props) {
    // TODO: need to make env determined according to url
    // const env = 'dev'; // Acquia Drupal Environment to Call for the JSON API. Set to promises.
    const [asset_type, setAssetType] = useState(props.assettype);
    const [mdlasset, setMdlAsset] = useState({});
    const status = useStatus();
    const inline = props.inline || false;

    /**
     * Effect used to normalize links in Asset Pages after loading so that links do not go outside of standalon
     * function found in ../common/utils.js
     */
    useEffect(() => {
        // normalizeLinks(asset_type);
    });

    const params = useParams();
    let id = params.relId || params.id || params.nid; // When ID param is just a number
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
            promises = [getMandalaAssetDataPromise(asset_type, id)];
        } else if (asset_type == 'audio-video') {
            promises = [getLegacyAssetPromise(asset_type, id)];
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
                            setMdlAsset(new_mdlasset);
                            changed = true;

                            if (!inline) {
                                status.clear();
                                status.setHeaderTitle(new_mdlasset.title);
                                status.setType(asset_type);
                                status.setId(new_mdlasset.id);
                            }
                        } else if (mdlasset.id !== new_mdlasset.id) {
                            setMdlAsset(new_mdlasset);
                            changed = true;

                            if (!inline) {
                                status.clear();
                                status.setHeaderTitle(new_mdlasset.title[0]);
                                status.setType(asset_type);
                                status.setId(new_mdlasset.id);
                            }
                        }
                    }
                } else if (call_status === 'rejected') {
                    setMdlAsset(false);
                    changed = true;
                }
            })
            .catch((e) => {
                console.error('oh dear! failure!??? ', e, promises);
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
