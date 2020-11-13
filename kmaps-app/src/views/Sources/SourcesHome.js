import React, { useEffect } from 'react';
import useStatus from '../../hooks/useStatus';
import { AssetHomeCollection } from '../common/AssetHomeCollection';

export function SourcesHome(props) {
    return (
        <div className={'assethome sources'}>
            <div className={'desc'}>
                <p>This pages shows all sources in this project.</p>
            </div>
            <AssetHomeCollection asset_type={'sources'} />
        </div>
    );
}

export default SourcesHome;
