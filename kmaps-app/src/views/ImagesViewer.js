import React, { useEffect } from 'react';
import useStatus from '../hooks/useStatus';
import useAsset from '../hooks/useAsset';
import { useRouteMatch } from 'react-router';
import { fitDimensions, grokId } from './common/utils';

export function ImagesViewer(props) {
    const match = useRouteMatch();
    console.log('ImagesViewer: match params = ', match.params);
    console.log('ImagesViewer: props = ', props);

    const { nid, relId, id, viewerType } = match.params;
    const status = useStatus();

    // TODO should we calculate MAX_HEIGHT and MAX_WIDTH?
    const MAX_HEIGHT = 800;
    const FULL_WIDTH = 1000;

    const targetId = relId || id;
    const imageId = grokId(targetId);
    const imageData = useAsset('images', imageId);
    const loaded = (imageData && true) || false;

    useEffect(() => {
        if (!props.inline) {
            let imgDoc = null;
            imgDoc = imageData?.docs?.length ? imageData.docs[0] : null;
            status.clear();
            status.setHeaderTitle(
                imgDoc?.caption || imgDoc?.title || 'ImageViewer'
            );
            status.setType('images');
        }
    }, [imageData]);

    let thumbUrl, imgHeight, imgWidth, fullUrl;
    if (loaded) {
        thumbUrl = imageData.docs[0]?.url_thumb;
        imgHeight = imageData.docs[0]?.img_height_s;
        imgWidth = imageData.docs[0]?.img_width_s;
        fullUrl = thumbUrl.replace('200,200', FULL_WIDTH + ',' + MAX_HEIGHT);
        const { height: dispHeight, width: dispWidth } = fitDimensions(
            MAX_HEIGHT,
            FULL_WIDTH,
            imgHeight,
            imgWidth
        );
        return (
            <div className={'images legacy'}>
                {loaded && (
                    <img src={fullUrl} height={dispHeight} width={dispWidth} />
                )}
                <h4>NOT YET IMPLEMENTED IMAGES</h4>{' '}
                <pre>{JSON.stringify(imageData, undefined, 3)}</pre>
                <pre>
                    {JSON.stringify({ ...props, sui: null }, undefined, 3)}
                </pre>
            </div>
        );
    } else {
        return <>Loading...</>;
    }
}
