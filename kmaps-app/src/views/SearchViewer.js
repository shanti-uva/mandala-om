import React, { useEffect } from 'react';
import { FeatureCollection } from './common/FeatureCollection';
import useStatus from '../hooks/useStatus';
import { useStoreState } from 'easy-peasy';

export function SearchViewer(props) {
    const status = useStatus();
    const loadingState = useStoreState((state) => state.search.loadingState);
    // console.log("loadingState = " , loadingState);
    useEffect(() => {
        status.clear();
        status.setHeaderTitle('Search Results');
        status.setSubTitle('For a Better Tomorrow...');
    });

    let output = (
        <FeatureCollection
            {...props}
            viewMode={'deck'}
            loadingState={loadingState}
            inline={false}
        />
    );
    return output;
}
