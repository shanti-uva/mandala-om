import React, { useEffect } from 'react';
import useStatus from '../hooks/useStatus';

export function ImagesViewer(props) {
    const status = useStatus();

    useEffect(() => {
        if (!props.inline) {
            console.log(props);
            status.clear();
            status.setHeaderTitle('Image Viewer For A Better Tomorrow');
            status.setType('images');
        }
    });

    return (
        <div className={'images legacy'}>
            NOT YET IMPLEMENTED IMAGES LEGACY{' '}
            <pre>{JSON.stringify(props.kmasset)}</pre>
        </div>
    );
}
