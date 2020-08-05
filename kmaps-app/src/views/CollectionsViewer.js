import React, { useEffect } from 'react';
import useStatus from '../hooks/useStatus';

export function CollectionsViewer(props) {
    const status = useStatus();

    useEffect(() => {
        if (!props.inline) {
            console.log(props);
            status.clear();
            status.setHeaderTitle('Collections Viewer For A Better Tomorrow');
            status.setType('collections');
        }
    });

    return (
        <div className={'Collections legacy'}>
            NOT YET IMPLEMENTED Collections LEGACY{' '}
            <pre>{JSON.stringify(props.kmasset)}</pre>
        </div>
    );
}
