import React from 'react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './FeatureFoldOutViewer.scss';
import { useLocation, Link } from 'react-router-dom';
import { MandalaPopover } from './MandalaPopover';
import $ from 'jquery';

export function FeatureFoldOutViewer(props) {
    let location = useLocation();
    const [uid, setUid] = useState();
    const imgUid = props.focus?.alt;

    useEffect(() => {});
    if (!props.focus) {
        return null;
    }
    const currimg = props.focus;
    let date_created = currimg?.date_created;
    if (date_created) {
        const dt = new Date(date_created);
        date_created = dt.toLocaleDateString();
    }
    const info = (
        <div className={'info'}>
            <span className={'creator'}>{currimg.creator}</span>
            <span className={'size'}>
                {currimg.full_width}x{currimg.full_height}
            </span>
            <span className={'date'}>{date_created}</span>
        </div>
    );

    const desc = currimg?.summary ? (
        <div className={'summary'}>{currimg.summary}</div>
    ) : (
        ''
    );
    const itemlink = props?.inline
        ? createAssetViewURL(currimg.id, currimg.asset_type, location)
        : `/${currimg.asset_type}/${currimg.id}`;
    return (
        <>
            <span id={'fov-close'} className={'c-foviewer__close'}>
                <span className={'u-icon__close2'}></span>{' '}
            </span>
            <div className={'c-foviewer__inner'}>
                <div id="previmg" className="prev arrow">
                    <span className="u-icon__arrow3-left"></span>
                </div>
                <div className={'c-foviewer__image'}>
                    <img src={currimg.original} />
                </div>
                <div className={'c-foviewer__details'}>
                    <h2>
                        <span className={'u-icon__images'}></span>{' '}
                        {currimg.caption}
                    </h2>
                    {info}
                    <div className={'ids'}>ID: {currimg?.id}</div>
                    {desc}
                    <KmapsRow domain={'subjects'} data={currimg.subjects} />
                    <KmapsRow domain={'places'} data={currimg.places} />
                    <KmapsRow domain={'terms'} data={currimg.terms} />
                    <div className={'link'}>
                        <Link to={itemlink}>
                            Details{' '}
                            <span
                                className={'u-icon__angle-double-right'}
                            ></span>
                        </Link>
                    </div>
                </div>
                {/*
                <div className={'d-none'}>
                    <pre>focus = {JSON.stringify(currimg, undefined, 2)}</pre>
                </div>
                */}
                <div id="nextimg" className="next arrow">
                    <span className="u-icon__arrow3-right"></span>
                </div>
            </div>
        </>
    );
}

export function FeatureFoldOutPortal({
    children,
    portalRootId,
    focused,
    galleryRef,
}) {
    const mount = document.getElementById(portalRootId);
    const el =
        mount && mount?.children?.length > 0
            ? mount.children[0]
            : document.createElement('div');
    useEffect(() => {
        if (mount && el !== mount.children[0]) {
            mount.appendChild(el);
        }
    }, [el, mount]);
    return createPortal(children, el);
}

function KmapsRow(props) {
    const domain = props.domain;
    let data = props.data;
    if (!data) {
        return null;
    }

    const kmaplinks = data.map((km, n) => {
        const pts = km.split('|');
        if (pts.length > 1) {
            const label = pts[0];
            const pts2 = pts[1].split('-');
            const kid = pts2.length > 1 ? pts2[1] : false;
            if (kid) {
                const mykey =
                    domain + '-' + kid + Math.ceil(Math.random() * 10000);
                return (
                    <MandalaPopover
                        domain={domain}
                        kid={kid}
                        children={[label]}
                        key={mykey}
                    />
                );
            }
        }
        return null;
    });

    return (
        <div className={'kmaprow ' + domain}>
            <span className={'u-icon__' + domain + ' icon'}></span>
            {kmaplinks}
        </div>
    );
}

function createAssetViewURL(avuid, asset_type, location) {
    if (location.pathname.includes('_definitions-')) {
        let path = location.pathname.split('/');
        const relatedIndex = path.findIndex((el) => el.includes('related'));
        path.splice(relatedIndex + 1);
        return `${path.join('/')}/view/${avuid}?asset_type=${asset_type}`;
    }
    return `./view/${avuid}?asset_type=${asset_type}`;
}
