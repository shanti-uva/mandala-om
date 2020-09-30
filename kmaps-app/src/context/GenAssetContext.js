import React, { useState, useEffect } from 'react';
import useAsset from '../hooks/useAsset';
import useMandala from '../hooks/useMandala';
import { useParams } from 'react-router';

/**
 *    Container which injects the Mandala asset data, before rendering it.
 *    It takes a prop "assetType" set to the asset type and uses any of the following params:
 *          relId, id, nid
 *    It injects the props into the viewer for that asset type:
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
 *           <MdlAssetContext assetType={'texts'}>
 *               <TextsViewer onStateChange={props.onStateChange}/>
 *           </MdlAssetContext>
 *
 * */
export default function GenAssetContext(props) {
    const [asset_type, setAssetType] = useState(props.assetType);
    const [mdlasset, setMdlAsset] = useState(null);

    const params = useParams();
    let nid = params.relId || params.id || params.nid; // When ID param is just a number
    if (nid.indexOf('-') > 1) {
        // When ID param is something like "texts-1234".
        nid = nid.split('-').pop();
    }
    const solrdata = useAsset(asset_type, nid);
    const nodejson = useMandala(solrdata);

    useEffect(() => {
        if (solrdata?.docs && solrdata.docs.length > 0) {
            setMdlAsset(solrdata.docs[0]);
        } else if (solrdata.status === 'success') {
            setMdlAsset('not-found');
        }
    }, [solrdata]);

    return React.Children.map(props.children, (child) => {
        if (child.type) {
            return React.cloneElement(child, {
                asset_type: asset_type,
                id: nid,
                mdlasset: mdlasset,
                nodejson: nodejson,
            });
        } else {
            return child;
        }
    });
}
