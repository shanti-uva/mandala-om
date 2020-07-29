import React, { useEffect } from 'react';
import useStatus from '../hooks/useStatus';

export function PlacesHome(props) {
    const status = useStatus();

    useEffect(() => {
        status.clear();
        status.setHeaderTitle('Places Home');
    });

    return <> Places Home: Not much here yet.. </>;
}

export default PlacesHome;
