import React, { useEffect, useState } from 'react';
import { AssetHomeCollection } from '../common/AssetHomeCollection';

export function AudioVideoHome(props) {
    return (
        <div className={'assethome audio-video'}>
            <div className={'desc'}>
                <p>
                    This pages shows all the audio-video resources in this
                    project.
                </p>
            </div>
            <AssetHomeCollection asset_type={'audio-video'} />
        </div>
    );
}

export default AudioVideoHome;
