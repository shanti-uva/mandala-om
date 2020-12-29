import { useParams } from 'react-router-dom';
import React from 'react';
import { FeatureGallery } from './FeatureGallery';
import { FeatureCollection } from './FeatureCollection';

// Special case of the FeatureGallery
export function RelatedsGallery(props) {
    const { relatedType: type, definitionID } = useParams(); // USES PARAMS from React Router  Refactor?
    const allAssets = props.relateds?.assets;
    const assets = allAssets ? allAssets[type] : null;
    const docs = assets?.docs;

    // Filter docs to only show those that have the definitionID specified
    const defID = definitionID ?? 'any';
    let filteredDocs = docs;
    if (defID !== 'any') {
        filteredDocs = docs.filter((doc) => doc.kmapid.includes(defID));
    }

    // Give a nice title.
    const title = type !== 'all' ? `Related ${type}` : 'All Related Items';
    return (
        <FeatureCollection
            docs={filteredDocs}
            pager={props.pager}
            numFound={filteredDocs?.length ?? 0}
            title={title}
            viewMode={'gallery'}
            inline={true}
        />
    );
}
