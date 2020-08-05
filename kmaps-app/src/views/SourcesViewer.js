import React, { useEffect } from 'react';
import useStatus from '../hooks/useStatus';

export function SourcesViewer(props) {
    const status = useStatus();

    useEffect(() => {
        if (!props.inline) {
            console.log(props);
            status.clear();
            status.setHeaderTitle('Sources Viewer For A Better Tomorrow');
            status.setType('sources');
        }
    });

    return (
        <div className={'Sources legacy'}>
            NOT YET IMPLEMENTED Sources{' '}
            <pre>{JSON.stringify(props.kmasset)}</pre>
        </div>
    );
}
