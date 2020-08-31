import React, { useEffect } from 'react';
import { useStoreState } from '../model/StoreModel';
import { KmapLink } from '../views/common/KmapLink';
export function ContentHeader(props) {
    const status = useStoreState((state) => state.status);
    // console.error("ContentHeader status = " , status);
    // console.log(" ContentHeader path = ", status.path)
    const sep = '\u00BB';
    let pathy = [];
    status.path.forEach((link, i) => {
        if (i !== 0) {
            pathy.push(sep);
        }
        pathy.push(
            <KmapLink key={link.uid} uid={link.uid} label={link.name} />
        );
    });

    const convertedPath = pathy;

    const cheader = (
        <div
            id="sui-header"
            className={`sui-header legacy ${props.siteClass} ${status.type}`}
        >
            <div id="sui-contentHead" className="sui-contentHead legacy">
                <div>
                    <span>
                        <span
                            className={`icon shanticon-${status.type}`}
                        ></span>
                        <span className={'sui-contentHeader-title'}>
                            {status.headerTitle}
                        </span>
                    </span>
                    <span className={'sui-contentHeader-id float-right'}>
                        {status.id}
                    </span>
                    <span className={'sui-contentHeader-sub'}>
                        {status.subTitle}
                    </span>
                    <span className={'sui-breadCrumbs'}>{convertedPath}</span>
                </div>
            </div>
        </div>
    );
    return cheader;
}
