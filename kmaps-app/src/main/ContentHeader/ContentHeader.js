import React, { useEffect } from 'react';
import { useStoreState } from '../../model/StoreModel';
import { KmapLink } from '../../views/common/KmapLink';
import './ContentHeader.scss';

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
            id="c-content__header__main"
            className={`c-content__header__main sui-header legacy ${props.siteClass} ${status.type}`}
        >
            <div
                id="c-content__header__main__wrap"
                className="c-content__header__main__wrap legacy"
            >
                <h1 className={'c-content__header__main__title'}>
                    <span className={`icon u-icon__${status.type}`}></span>
                    {status.headerTitle}
                </h1>

                <div className={'c-content__header__breadcrumb breadcrumb'}>
                    {convertedPath}
                </div>
                <h5 className={'c-content__header__main__id'}>{status.id}</h5>
                <h4 className={'c-content__header__main__sub'}>
                    {status.subTitle}
                </h4>
            </div>
        </header>
    );
    return cheader;
}
