import React, { useEffect } from 'react';
//import { useStoreState } from '../../model/StoreModel';
import { Link } from 'react-router-dom';
import { KmapLink } from '../../views/common/KmapLink';
import './ContentHeader.scss';
import { useKmap } from '../../hooks/useKmap';
import { capitalAsset, queryID } from '../../views/common/utils';

export function ContentHeader(props) {
    //const status = useStoreState((state) => state.status);
    // console.error("ContentHeader status = " , status);
    // console.log(" ContentHeader path = ", status.path)
    const sep = '>';
    const appath =
        process.env.REACT_APP_PUBLIC_URL.split(window.location.host)[1] + '/';
    const mypath = window.location.pathname.replace(appath, '').trim('/');
    const [first, mid, last] = mypath.split('/');
    const itemType = first;
    const queryType = itemType + '*';
    const isCollection = mid === 'collection';
    const itemId = isCollection ? last : mid;
    console.log(itemType, itemId, isCollection);
    const {
        isLoading: isItemLoading,
        data: itemData,
        isError: isItemError,
        error: itemError,
    } = useKmap(queryID(queryType, itemId), 'asset');

    console.log('Header query res', itemData);
    // status.path.forEach((link, i) => {
    //     if (i !== 0) {
    //         pathy.push(sep);
    //     }
    //     if (link.uid.charAt(0) == '/') {
    //         // Allow regular relative links without processing as kmaps
    //         pathy.push(
    //             <Link
    //                 key={link.uid}
    //                 to={link.uid}
    //                 className={'breadcrumb-item'}
    //             >
    //                 {link.name}
    //             </Link>
    //         );
    //     } else {
    //         pathy.push(
    //             <KmapLink
    //                 key={link.uid}
    //                 className={'breadcrumb-item'}
    //                 uid={link.uid}
    //                 label={link.name}
    //             />
    //         );
    //     }
    // });

    let convertedPath = 'Loading';
    let mytitle = 'Loading';
    if (!isItemLoading) {
        if (!isItemError) {
            mytitle = itemData?.title;
            const basepath = appath + '/';
            convertedPath = itemData?.collection_uid_path_ss?.map(
                (cup, cind) => {
                    const cplabel = itemData?.collection_title_path_ss[cind];
                    const url = basepath + cup.replace(/-/g, '/');
                    return (
                        <a className="breadcrumb-item" href={url}>
                            {cplabel}
                        </a>
                    );
                }
            );
        } else {
            convertedPath = mytitle = 'Error!';
        }
    }

    const cheader = (
        <header
            id="c-content__header__main"
            className={`c-content__header__main legacy ${props?.siteClass} ${itemType}`}
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
                    <a className="breadcrumb-item" href="#">
                        {capitalAsset(itemType)}
                    </a>
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
