import React, { useEffect } from 'react';
//import { useStoreState } from '../../model/StoreModel';
import { Link } from 'react-router-dom';
import { KmapLink } from '../../views/common/KmapLink';
import './ContentHeader.scss';

export function ContentHeader(props) {
    //const status = useStoreState((state) => state.status);
    // console.error("ContentHeader status = " , status);
    // console.log(" ContentHeader path = ", status.path)
    const sep = '>';
    let pathy = [];

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

    const convertedPath = pathy;

    // Dummy status
    let status = {
        type: 'subjects',
        headerTitle: 'Test Subject',
        id: '85193',
        subTitle: 'Sub Title',
    };

    const cheader = (
        <header
            id="c-content__header__main"
            className={`c-content__header__main legacy ${props.siteClass} ${status.type}`}
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
