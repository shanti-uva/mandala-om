import React, { useEffect } from 'react';
import { useStoreState } from '../model/StoreModel';
import { KmapLink } from '../views/common/KmapLink';
export function ContentHeader(props) {
    const status = useStoreState((state) => state.status);
    // console.error("ContentHeader status = " , status);
    // console.log(" ContentHeader path = ", status.path)
    const sep = '>';
    let pathy = [];
    status.path.forEach((link, i) => {
        if (i !== 0) {
            pathy.push(sep);
        }
        pathy.push(
            <KmapLink
                className={'breadcrumb-item'}
                key={link.uid}
                uid={link.uid}
                label={link.name}
            />
        );
    });

    const convertedPath = pathy;

    const cheader = (
        <header
            id="c-contentHeader"
            className={`c-contentHeader__main sui-header legacy ${props.siteClass} ${status.type}`}
        >
            <div
                id="c-contentHeader__main"
                className="c-contentHeader__main legacy"
            >
                <h1 className={'c-contentHeader__main__title'}>
                    <span
                        className={`icon white u-icon__${status.type}`}
                    ></span>
                    {status.headerTitle}
                </h1>

                <div className={'c-contentHeader__breadcrumb breadcrumb'}>
                    {convertedPath}
                </div>
                <span className={'c-contentHeader__main__id'}>{status.id}</span>
                <div className={'c-contentHeader__main__sub'}>
                    {status.subTitle}
                </div>
            </div>
        </header>
    );
    return cheader;
}
