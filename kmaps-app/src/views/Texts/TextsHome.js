import React, { useEffect } from 'react';
import useStatus from '../hooks/useStatus';

export function TextsHome(props) {
    const status = useStatus();

    useEffect(() => {
        status.clear();
        status.setHeaderTitle('Texts Home');
    });

    return <> Texts Home: Not much here yet.. </>;
}

export default TextsHome;
