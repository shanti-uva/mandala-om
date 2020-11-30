import React, { useState, useEffect } from 'react';
import useStatus from '../hooks/useStatus';
import useAsset from '../hooks/useAsset';
import useMandala from '../hooks/useMandala';
import { NotFoundPage } from '../views/common/utilcomponents';
import { useParams } from 'react-router';

/**
 *    Container which injects the SOLR asset data and Mandala JSON data, before rendering an asset component.
 *    It takes a prop "assetType" set to the asset type and uses any of the following params:
 *          relId, id, nid
 *
 *    It injects the props into the viewer for that asset type:
 *          id: The integer part of the asset's ID
 *          asset_type: The name of the asset app, e.g. texts, visuals, etc. (necessary to make the api call)
 *          mdlasset:  The current ASSET data in json from Mandala
 *
 *    Uses hooks two hooks:
 *          useAsset: queries SOLR and gets the assets Solr record
 *          useMandala: takes the url_json from the solr record and loads the items json from the Drupal all
 *
 *    It then "injects" into that data into the children, the apps particular component, by cloning it with
 *    the prop information.
 *
 *    This is evoked within the ContentMain.js and should wrap the component of the Mandala App in question
 *    As for instance was done for texts:
 *           <MdlAssetContext assetType={'texts'}>
 *               <TextsViewer onStateChange={props.onStateChange}/>
 *           </MdlAssetContext>
 *
 * */
export default function GenAssetContext(props) {
    const asset_type = props.assetType;
    const [mdlasset, setMdlAsset] = useState(null);
    const [notfound, setNotFound] = useState(false);
    const params = useParams();
    let nid = params.relId || params.id || params.nid; // When ID param is just a number
    if (nid.indexOf('-') > 1) {
        // When ID param is something like "texts-1234".
        nid = nid.split('-').pop();
    }

    const status = useStatus();
    //status.setType(asset_type);

    const solrdata = useAsset(asset_type, nid);
    const nodejson = useMandala(solrdata);

    // console.log(`Use asset solrdata for ${asset_type}-${nid}`, solrdata);
    useEffect(() => {
        if (solrdata?.docs && solrdata.docs.length > 0) {
            setMdlAsset(solrdata.docs[0]);
        } else if (solrdata.status === 'success') {
            setNotFound(true);
        }
    }, [solrdata]);

    if (notfound) {
        let header = 'Not found';
        if (asset_type && typeof asset_type === 'string') {
            header = asset_type;
            header =
                header.charAt(0).toUpperCase() +
                header.substr(1).replace('-v', '-V');
            status.setHeaderTitle(header);
        }
        return <NotFoundPage type={asset_type} id={nid} />;
    } else {
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
}
