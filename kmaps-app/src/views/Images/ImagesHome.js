import React, { useEffect, useState } from 'react';
import { AssetHomeCollection } from '../common/AssetHomeCollection';
import useStatus from '../../hooks/useStatus';

export function ImagesHome(props) {
    const status = useStatus();
    status.setType('images');
    status.setHeaderTitle('Loading...');

    return (
        <div className={'assethome images'}>
            <div className={'desc'}>
                <p>This page shows all images in this project.</p>
            </div>
            <AssetHomeCollection asset_type={'images'} />
        </div>
    );
}

export default ImagesHome;
