import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FeatureCollection } from './FeatureCollection';
import { useKmapRelated } from '../../hooks/useKmapRelated';
import { useUnPackedMemoized } from '../../hooks/utils';
import { queryID } from '../../views/common/utils';

// Special case of the FeatureGallery
export default function RelatedsGallery({ baseType }) {
    let { id, relatedType: type, definitionID } = useParams(); // USES PARAMS from React Router  Refactor?
    definitionID = definitionID ?? 'noDefID';

    const [perPage, setPerPage] = useState(100);
    const [page, setPage] = useState(0); // Start will always be page * perPage
    const {
        isLoading: isRelatedLoading,
        data: relatedData,
        isError: isRelatedError,
        error: relatedError,
        isPreviousData,
    } = useKmapRelated(
        queryID(baseType, id),
        type,
        page,
        perPage,
        definitionID
    );
    const kmapsRelated = useUnPackedMemoized(
        relatedData,
        queryID(baseType, id),
        type,
        page,
        perPage
    );

    if (isRelatedLoading) {
        return <span>Relateds Gallery Skeleton</span>;
    }

    if (isRelatedError) {
        return <span>Relateds Gallery Error: {relatedError.message}</span>;
    }

    const allAssets = kmapsRelated?.assets;
    const assets = allAssets ? allAssets[type] : null;
    const docs = assets?.docs;

    // Give a nice title.
    const title = type !== 'all' ? `Related ${type}` : 'All Related Items';
    return (
        <FeatureCollection
            docs={docs}
            title={title}
            viewMode={'gallery'}
            inline={true}
            page={page}
            setPage={setPage}
            perPage={perPage}
            setPerPage={setPerPage}
            isPreviousData={isPreviousData}
            hasMore={kmapsRelated.hasMore}
            assetCount={assets.count}
            relateds={kmapsRelated}
        />
    );
}
