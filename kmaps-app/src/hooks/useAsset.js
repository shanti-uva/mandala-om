import React from 'react';
import { useSolr } from './useSolr';
const QUERY_KEY = 'kmassets';

const useAsset = (asset_type, nid) => {
    const querySpecs = {
        index: 'assets',
        params: {
            q: `asset_type:${asset_type} AND id:${nid}`,
            rows: 1,
        },
    };

    console.log('useAsset: querySpecs = ', querySpecs);
    const resource = useSolr(QUERY_KEY, querySpecs);
    console.log('useAsset: returning resource = ', resource);
    return resource;
};

export default useAsset;
