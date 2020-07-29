import React, { useEffect } from 'react';
import useStatus from '../../hooks/useStatus';

export function TermsHome(props) {
    const status = useStatus();

    useEffect(() => {
        status.clear();
        status.setHeaderTitle('Terms Home');
    });

    return <> Terms Home: Not much here yet.. </>;
}

export default TermsHome;
