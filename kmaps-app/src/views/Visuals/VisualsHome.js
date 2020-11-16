import React, { useEffect } from 'react';
import useStatus from '../../hooks/useStatus';
import { AssetHomeCollection } from '../common/AssetHomeCollection';

export function VisualsHome(props) {
    const status = useStatus();
    status.setType('visuals');
    status.setHeaderTitle('Loading...');

    return (
        <div className={'assethome visuals'}>
            <div className={'desc'}>
                <p>This page shows all visualizations in this project.</p>
            </div>
            <AssetHomeCollection asset_type={'visuals'} />
        </div>
    );
}

export default VisualsHome;
