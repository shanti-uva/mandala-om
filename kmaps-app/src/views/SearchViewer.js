import React, { useEffect } from 'react';
import { FeatureCollection } from './common/FeatureCollection';
import useStatus from '../hooks/useStatus';
import { useStoreState } from 'easy-peasy';
import qs from 'qs';
import { useHistory } from 'react-router';

export function SearchViewer(props) {
    const status = useStatus();
    const history = useHistory();
    const loadingState = useStoreState((state) => state.search.loadingState);
    const searchState = useStoreState((state) => state.search);

    // assemble a truncated query string
    const searchQueryString = qs.stringify(
        {
            page: {
                current: searchState.page.current,
                rows: searchState.page.rows,
            },
            query: {
                filters: searchState.query.filters,
                searchText: searchState.query.searchText,
            },
        },
        { allowDots: true }
    );

    useEffect(() => {
        // Assemble and Set Header Data
        const searchText =
            searchState.query?.searchText?.length > 1
                ? '"' + searchState.query.searchText + '"'
                : '*';
        const mod_count = searchState.query?.filters?.length || 0;
        const searchStateModifiers = mod_count
            ? ' (+' + mod_count + ' filter' + (mod_count !== 1 ? 's' : '') + ')'
            : '';
        status.clear();
        status.setHeaderTitle(
            'Search Results: ' + searchText + ' ' + searchStateModifiers
        );
        status.setSubTitle('For a Better Tomorrow...');
    }, [searchQueryString]);

    useEffect(() => {
        history.replace(`?${searchQueryString}`);
    }, [searchQueryString]);

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
