import React, { useEffect } from 'react';
import useStatus from '../../hooks/useStatus';

export function AudioVideoHome(props) {
    const status = useStatus();

    useEffect(() => {
        status.clear();
        status.setHeaderTitle('Audio Video Home');
    });

    return <> Audio Video Home: Not much here yet.. </>;
}

export default AudioVideoHome;
