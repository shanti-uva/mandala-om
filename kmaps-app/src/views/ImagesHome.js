import React, { useEffect } from 'react';
import useStatus from '../hooks/useStatus';
export function ImagesHome(props) {
    const status = useStatus();

    useEffect(() => {
        status.clear();
        status.setHeaderTitle('Images Home');
    });

    return <> Images Home: Not much here yet.. </>;
}

export default ImagesHome;
