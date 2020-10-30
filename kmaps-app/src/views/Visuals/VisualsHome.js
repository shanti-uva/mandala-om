import React, { useEffect } from 'react';
import useStatus from '../../hooks/useStatus';

export function VisualsHome(props) {
    const status = useStatus();

    useEffect(() => {
        status.clear();
        status.setHeaderTitle('Visuals Home');
    });

    return <> Visuals Home: Not much here yet.. </>;
}

export default VisualsHome;
