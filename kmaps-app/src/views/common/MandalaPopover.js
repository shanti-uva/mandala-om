import React, { useState, useRef } from 'react';
import { Overlay, Popover } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';
import { useKmap } from '../../hooks/useKmap';
import _ from 'lodash';

const MandalaPopover = ({ domain, kid, placement, kmapid, children }) => {
    const [show, setShow] = useState(false);
    const [byPass, setByPass] = useState(true);

    // Info for Kmap Itself: kmapRes
    const { isError: kmapIsError, data: kmapRes, error: kmapError } = useKmap(
        `${domain}-${kid}`,
        'info',
        byPass
    );
    // Info of Related Kmaps/Assets: relRes
    const { isError: relIsError, data: relRes, error: relError } = useKmap(
        `${domain}-${kid}`,
        'related',
        byPass
    );

    const target = useRef(null);
    placement = placement ?? 'bottom';
    let isTib = false;

    const showPop = (event) => {
        setByPass(false);
        setShow(true);
    };

    let title = <Skeleton />;

    let content = (
        <div style={{ width: '100%' }}>
            <p style={{ fontSize: 16, lineHeight: 1.2 }}>
                <Skeleton count={8} />
            </p>
        </div>
    );

    // Definitions for Terms
    let termdefs = false;
    if (domain === 'terms') {
        termdefs = [];
        _.map(kmapid, (kidi) => {
            if (kidi.includes(`terms-${kid}_definitions`)) {
                termdefs.push(kidi.split('-').pop());
            }
        });
    }

    if (kmapRes && relRes) {
        isTib = kmapRes.tree === 'terms' ? !!kmapRes.name_tibt : false;
        title = isTib ? kmapRes.name_tibt[0] : kmapRes.header;
        content = (
            <MandalaPopoverBody
                domain={domain}
                kid={kid}
                defs={termdefs}
                info={kmapRes}
                related={relRes}
                kmapIsError={kmapIsError}
                relIsError={relIsError}
            />
        );
    }

    if (kmapIsError || relIsError) {
        title = <span>Error occurred</span>;
        let error1 = '';
        let error2 = '';
        if (kmapIsError) {
            error1 = <div>Error: {kmapError.message}</div>;
        }
        if (relIsError) {
            error2 = <div>Error: {relError.message}</div>;
        }
        content = (
            <span>
                {error1}
                {error2}
            </span>
        );
    }

    return (
        <>
            <span
                data-kmdomain={domain}
                data-kmid={kid}
                className="d-inline-flex align-items-center kmap-tag-group"
            >
                {children}
                {termdefs && (
                    <span className="deflinks">
                        {termdefs.map((defn) => {
                            return (
                                <Link
                                    to={`/${domain}/${domain}-${kid}#def-${defn}`}
                                    title={`Definition ${defn}`}
                                >
                                    {defn}
                                </Link>
                            );
                        })}
                    </span>
                )}
            </span>
            <span onMouseEnter={showPop} onMouseLeave={() => setShow(false)}>
                <span ref={target} className="popover-link">
                    <span className="icon u-icon__kmaps-popover" />
                </span>
                <Overlay
                    target={target.current}
                    placement={placement}
                    show={show}
                >
                    <Popover
                        id="popover-contained"
                        className="related-resources-popover processed"
                    >
                        <Popover.Title as="h5" className={isTib ? 'bo' : ''}>
                            {title} <span className={'kmid'}>{kid}</span>
                        </Popover.Title>
                        <Popover.Content>{content}</Popover.Content>
                    </Popover>
                </Overlay>
            </span>
        </>
    );
};

function MandalaPopoverBody(props) {
    if (props.kmapIsError || props.relIsError) {
        console.error(props.kmapIsError ? props.kmapError : props.relError);
        return <span className={'red'}>Error occurred ....</span>;
    }
    const kminfo = props.info;

    const related = props.related;
    const defs = props?.defs;

    // Sort related by Asset/Kmap type (groupValue)
    related.sort((a, b) => {
        const alabel = a.groupValue;
        const blabel = b.groupValue;
        if (alabel < blabel) {
            return -1;
        }
        if (alabel > blabel) {
            return 1;
        }
        return 0;
    });
    const domain = props.domain;
    const kid = props.kid;
    const caption =
        kminfo.caption_eng && kminfo.caption_eng.length > 0
            ? kminfo.caption_eng[0].replace(/<\/?p>/g, '') + ' '
            : '';
    const pubfolder = process.env.PUBLIC_URL;
    const mandala_base = pubfolder; // TODO: Check if this needs to change?
    const kmap_item_page =
        mandala_base + '/' + domain + '/' + domain + '-' + kid;

    // Feature types
    let featuretypes = '';
    if (kminfo.feature_type_ids && kminfo.feature_type_ids.length > 0) {
        featuretypes = (
            <div className="other featuretypes clearfix">
                <p>
                    <strong>Feature Type</strong>
                    {kminfo.feature_type_ids.map((item, index) => {
                        const url = mandala_base + '/subjects/subjects-' + item;
                        return (
                            <>
                                <a href={url} key={domain + kid + index}>
                                    {kminfo.feature_types[index]}
                                </a>
                            </>
                        );
                    })}
                </p>
            </div>
        );
    }

    // Ancestors
    let ancestors = '';
    const ancestor_ids =
        kminfo.tree === 'terms' && kminfo['ancestor_ids_tib.alpha']
            ? kminfo['ancestor_ids_tib.alpha']
            : kminfo.ancestor_ids_generic;
    const ancestor_labels =
        kminfo.tree === 'terms' && kminfo['ancestors_tib.alpha']
            ? kminfo['ancestors_tib.alpha']
            : kminfo.ancestors;
    if (ancestor_ids && ancestor_ids.length > 1) {
        const anclabel = kminfo.tree[0].toUpperCase() + kminfo.tree.substr(1);
        ancestors = (
            <div className="parents clearfix">
                <p>
                    <strong>{anclabel}</strong>&nbsp;
                    {ancestor_ids.map((aid, index) => {
                        if (index === ancestor_ids.length - 1) {
                            return;
                        } // Don't show self in ancestry list
                        const aurl =
                            mandala_base +
                            '/' +
                            kminfo.tree +
                            '/' +
                            kminfo.tree +
                            '-' +
                            aid;
                        const label = ancestor_labels[index];
                        const akey = 'akey-' + aid + '-' + index;
                        return (
                            <a key={akey} href={aurl}>
                                {label}
                            </a>
                        );
                    })}
                </p>
            </div>
        );
    }

    // Term Information
    let term_info = '';
    if (kminfo.tree === 'terms' && kminfo.associated_subject_ids) {
        term_info = (
            <>
                <div className="other">
                    <strong>Wylie</strong>
                    {kminfo.header}
                </div>
                <div className="termtypes">
                    {kminfo.associated_subject_ids.map((item, n) => {
                        const myurl =
                            mandala_base + '/subjects/subjects-' + item;
                        return (
                            <a href={myurl} key={myurl + n}>
                                {kminfo.associated_subjects[n]}
                            </a>
                        );
                    })}
                </div>
            </>
        );
    }

    // Related Tabs
    let related_tabs = (
        <>
            {related.map((item, index) => {
                const assettype = item.groupValue;
                if (assettype === 'picture') {
                    return;
                }
                if (assettype === 'texts:pages') {
                    return;
                }
                const myurl =
                    kmap_item_page + '/related-' + assettype + '/deck';
                const label =
                    'Related ' +
                    assettype[0].toUpperCase() +
                    assettype.substr(1).replace('-v', ' V').replace('-', ' ');
                const iconclass = 'icon u-icon__' + assettype;
                return (
                    <div className="popover-footer-button" key={myurl}>
                        <a href={myurl} className={iconclass}>
                            {label} ({item.doclist.numFound})
                        </a>
                    </div>
                );
            })}
        </>
    );
    let defdiv = '';
    if (defs) {
        defdiv = (
            <div className="defs">
                <strong>Definitions</strong>
                <span className="deflinks">
                    {defs.map((defn) => {
                        return (
                            <Link
                                to={`/${domain}/${domain}-${kid}#def-${defn}`}
                                title={`Definition ${defn}`}
                            >
                                {defn}
                            </Link>
                        );
                    })}
                </span>
            </div>
        );
    }
    // Return JSX Markup for popover body
    return (
        <div className={'react-popover-body'}>
            <span className="kmdomain">{domain}</span>
            <span className="kmid">{kid}</span>
            <div className="popover-body">
                {term_info}
                <div className="desc">
                    {caption}
                    For more information about this term, see Full Entry below.
                </div>
                {defdiv}
                {featuretypes}
                {ancestors}
            </div>
            <div className="popover-footer">
                <div className="popover-footer-button">
                    <a
                        className="icon u-icon__link-external"
                        href={kmap_item_page}
                    >
                        Full Entry
                    </a>
                </div>
                {related_tabs}
            </div>
        </div>
    );
}

export { MandalaPopover };
