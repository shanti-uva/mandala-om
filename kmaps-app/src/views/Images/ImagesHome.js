import React, { useEffect, useState } from 'react';
import { AssetHomeCollection } from '../common/AssetHomeCollection';

export function ImagesHome(props) {
    return (
        <div className={'assethome images'}>
            <div className={'desc'}>
                <p>This pages shows all images in this project.</p>
            </div>
            <AssetHomeCollection asset_type={'images'} />
        </div>
    );
}

export default ImagesHome;
