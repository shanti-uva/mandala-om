import React, { useEffect } from 'react';
import useStatus from '../../hooks/useStatus';
import { AssetHomeCollection } from '../common/AssetHomeCollection';

export function TextsHome(props) {
    return (
        <div className={'assethome texts'}>
            <div className={'desc'}>
                <p>This pages shows all texts in this project.</p>
            </div>
            <AssetHomeCollection asset_type={'texts'} />
        </div>
    );
}

export default TextsHome;
