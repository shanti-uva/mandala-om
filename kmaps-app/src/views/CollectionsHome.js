import React, { useEffect } from 'react';
import useStatus from '../hooks/useStatus';

export function CollectionsHome(props) {
    const status = useStatus();

    useEffect(() => {
        status.clear();
        status.setHeaderTitle('Collections Home');
    });

    return <> Collections Home: Not much here yet.. </>;
}

export default CollectionsHome;
