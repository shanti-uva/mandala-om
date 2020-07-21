import React, { useEffect } from 'react';
import { useStoreState } from '../model/StoreModel';
export function ContentHeader(props) {
    const status = useStoreState((state) => state.status);
    // console.error("ContentHeader status = " , status);

    const cheader = (
        <div id="sui-header" className={`sui-header legacy ${props.siteClass}`}>
            <div id="sui-contentHead" className="sui-contentHead legacy">
                <div>
                    <span>
                        <span
                            className={`icon shanticon-${status.type}`}
                        ></span>
                        <span className={'ml-2'}>{status.headerTitle}</span>
                    </span>
                    <span className={'sui-contentHeader-id float-right'}>
                        {status.id}
                    </span>
                    <span>{status.subTitle}</span>
                    <span className={'sui-breadCrumbs'}>
                        {status?.path?.join(' \u00BB ')}
                    </span>
                </div>
            </div>
        </div>
    );
    return cheader;
}
