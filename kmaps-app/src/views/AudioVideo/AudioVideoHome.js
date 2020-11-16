import React, { useEffect, useState } from 'react';
import { AssetHomeCollection } from '../common/AssetHomeCollection';
import useStatus from '../../hooks/useStatus';

export function AudioVideoHome(props) {
    const status = useStatus();
    status.setType('audio-video');
    status.setHeaderTitle('Loading...');

    return (
        <div className={'assethome audio-video'}>
            <div className={'desc'}>
                <p>
                    This page shows all the audio-video resources in this
                    project.
                </p>
            </div>
            <AssetHomeCollection asset_type={'audio-video'} />
        </div>
    );
}

export default AudioVideoHome;
