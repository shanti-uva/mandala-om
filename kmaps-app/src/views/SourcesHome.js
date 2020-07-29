import React, { useEffect } from 'react';
import useStatus from '../hooks/useStatus';

export function SourcesHome(props) {
    const status = useStatus();

    useEffect(() => {
        status.clear();
        status.setHeaderTitle('Sources Home');
    });

    return <> Sources Home: Not much here yet.. </>;
}

export default SourcesHome;
