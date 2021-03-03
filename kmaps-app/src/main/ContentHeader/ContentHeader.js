import React, { useEffect } from 'react';
//import { useStoreState } from '../../model/StoreModel';
import { Link } from 'react-router-dom';
import { KmapLink } from '../../views/common/KmapLink';
import './ContentHeader.scss';
import { useKmap } from '../../hooks/useKmap';
import { capitalAsset, queryID } from '../../views/common/utils';

export function ContentHeader({ siteClass, title, location }) {
    // const status = useStoreState((state) => state.status);
    // console.error("ContentHeader status = " , status);
    // console.log(" ContentHeader path = ", status.path)
    const sep = '>';
    console.log(location);
    const appath =
        process.env.REACT_APP_PUBLIC_URL.split(window.location.host)[1] + '/';
    const pgpath = location.pathname.substr(1);
    console.log(pgpath);
    const [first, mid, last] = pgpath?.split('/');
    const itemType = first;
    const queryType = itemType + '*';
    const isCollection = mid === 'collection';
    const itemId = isCollection ? last : mid;
    // console.log(itemType, itemId, isCollection);
    const {
        isLoading: isItemLoading,
        data: itemData,
        isError: isItemError,
        error: itemError,
    } = useKmap(queryID(queryType, itemId), 'asset');

    console.log('kmap data', itemData);
    let convertedPath = '... > ';
    let mytitle = itemData?.title ? itemData.title : '...';
    if (!isItemLoading) {
        if (!isItemError) {
            mytitle = itemData?.title;
            convertedPath = (
                <ContentHeaderBreadcrumbs
                    itemData={itemData}
                    itemTitle={mytitle}
                    itemType={itemType}
                />
            );
        } else {
            convertedPath = mytitle = 'Error!';
        }
    }

    const cheader = (
        <header
            id="c-content__header__main"
            className={`c-content__header__main legacy ${siteClass} ${itemType}`}
        >
            <div
                id="c-content__header__main__wrap"
                className="c-content__header__main__wrap legacy"
            >
                <h1 className={'c-content__header__main__title'}>
                    <span className={`icon u-icon__${itemType}`}></span>
                    {mytitle}
                </h1>

                <div className={'c-content__header__breadcrumb breadcrumb'}>
                    {convertedPath}
                </div>
                <h5 className={'c-content__header__main__id'}>{itemId}</h5>
                <h4 className={'c-content__header__main__sub'}>
                    {itemData?.subTitle}
                </h4>
            </div>
        </header>
    );
    return cheader;
}

function ContentHeaderBreadcrumbs({ itemData, itemTitle, itemType }) {
    let breadcrumbs = null;
    switch (itemType) {
        case 'places':
            breadcrumbs = itemData?.ancestor_ids_is?.map((aid, idn) => {
                const label = itemData.ancestors_txt[idn];
                return (
                    <Link to={`/places/${aid}`} className="breadcrumb-item">
                        {label}
                    </Link>
                );
            });
            console.log('places bc', breadcrumbs);
            break;

        default:
            breadcrumbs = itemData?.collection_uid_path_ss?.map((cup, cind) => {
                const cplabel = itemData?.collection_title_path_ss[cind];
                const url =
                    '/' +
                    cup
                        .replace(/-/g, '/')
                        .replace('audio/video', 'audio-video');
                return (
                    <Link to={url} className="breadcrumb-item">
                        {' '}
                        {cplabel}
                    </Link>
                );
            });
            breadcrumbs.push(
                <Link to="#" className="breadcrumb-item">
                    {itemTitle}
                </Link>
            );
    }
    breadcrumbs.unshift(
        <Link to="#" className="breadcrumb-item">
            {capitalAsset(itemType)}
        </Link>
    );
    return breadcrumbs;
}
