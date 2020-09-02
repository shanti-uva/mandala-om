import React, { useEffect } from 'react';
import useStatus from '../hooks/useStatus';
import useAsset from '../hooks/useAsset';
import { useRouteMatch } from 'react-router';
import { fitDimensions, grokId } from './common/utils';
import { Viewer } from 'react-iiif-viewer'; // see https://www.npmjs.com/package/react-iiif-viewer

export function ImagesViewer(props) {
    const solrdoc = props.mdlasset;
    const nodejson = props.nodejson;
    const status = useStatus();

    // TODO: should we calculate MAX_HEIGHT and MAX_WIDTH?
    const MAX_HEIGHT = 800;
    const MAX_WIDTH = 1024;

    const nid = props?.id || solrdoc?.id || nodejson?.nid || false;

    useEffect(() => {
        if (solrdoc) {
            status.clear();
            status.setHeaderTitle(
                solrdoc?.caption || solrdoc?.title || 'ImageViewer'
            );
            status.setType('images');
        }
    }, [solrdoc]);

    let thumbUrl, imgHeight, imgWidth, fullUrl;
    if (solrdoc) {
        console.log(solrdoc);
        thumbUrl = solrdoc?.url_thumb;
        imgHeight = solrdoc?.img_height_s;
        imgWidth = solrdoc?.img_width_s;
        fullUrl = thumbUrl
            ? thumbUrl.replace('200,200', MAX_WIDTH + ',' + MAX_HEIGHT)
            : '';
        const { height: dispHeight, width: dispWidth } = fitDimensions(
            MAX_HEIGHT,
            MAX_WIDTH,
            imgHeight,
            imgWidth
        );
        // solrdoc.url_iiif_s
        return (
            <div className={'images legacy'}>
                <Viewer iiifUrl={solrdoc.url_iiif_s} />
                {/*

                <img src={fullUrl} height={dispHeight} width={dispWidth} />
                   */}
                <h4>NOT YET IMPLEMENTED IMAGES</h4>{' '}
                <pre>{JSON.stringify(solrdoc, undefined, 3)}</pre>
                <pre>
                    {JSON.stringify({ ...props, sui: null }, undefined, 3)}
                </pre>
            </div>
        );
    } else {
        return <>Loading...</>;
    }
}
