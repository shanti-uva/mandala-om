import React, { useEffect } from 'react';
import { FeatureCollection } from './common/FeatureCollection';
import useStatus from '../hooks/useStatus';

export function SearchViewer(props) {
    const status = useStatus();
    useEffect(() => {
        status.clear();
        status.setHeaderTitle('Search Results');
        status.setSubTitle('For a Better Tomorrow...');
    });

    let output = <FeatureCollection {...props} viewMode={'deck'} />;
    return output;
}
