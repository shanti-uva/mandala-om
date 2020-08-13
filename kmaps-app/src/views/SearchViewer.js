import React, { useEffect } from 'react';
import { FeatureCollection } from './common/FeatureCollection';
import useStatus from '../hooks/useStatus';
import { useStoreState } from 'easy-peasy';

export function SearchViewer(props) {
    const status = useStatus();

    const loadingState = useStoreState((state) => state.search.loadingState);
    const searchState = useStoreState((state) => state.search);
    // console.log("loadingState = " , loadingState);
    useEffect(() => {
        status.clear();
        status.setHeaderTitle('Search Results');
        status.setSubTitle('For a Better Tomorrow...');
    });

    const searchy = {
        page: { current: searchState.page.current },
        query: { ...searchState.query },
    };

    console.log('SearchViewer: ', searchy);
    console.log(JSON.stringify(searchy, undefined, 3));

    let output = (
        <FeatureCollection
            {...props}
            viewMode={'deck'}
            loadingState={loadingState}
            inline={false}
            showSearchFilters={true}
        />
    );
    return output;
}
