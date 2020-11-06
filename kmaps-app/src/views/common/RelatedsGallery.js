import { useParams } from 'react-router-dom';
import React from 'react';
import { FeatureGallery } from './FeatureGallery';
import { FeatureCollection } from './FeatureCollection';

// Special case of the FeatureGallery
export function RelatedsGallery(props) {
    const { relatedType: type } = useParams(); // USES PARAMS from React Router  Refactor?
    const allAssets = props.relateds?.assets;
    const assets = allAssets ? allAssets[type] : null;
    const docs = assets?.docs;

    // Give a nice title.
    const title = type !== 'all' ? `Related ${type}` : 'All Related Items';
    return (
        <FeatureCollection
            docs={docs}
            pager={props.pager}
            numFound={assets.count}
            title={title}
            viewMode={'gallery'}
            inline={true}
        />
    );
}
