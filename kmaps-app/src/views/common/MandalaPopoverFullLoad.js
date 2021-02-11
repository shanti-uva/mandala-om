import React, { useRef, useState } from 'react';
import { useKmap } from '../../hooks/useKmap';
// import { ReactQueryDevtools } from 'react-query-devtools';
import { Overlay, Popover, Container, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * Mandala popover is component that displays a kmap term with the popover icon that shows the popover on hover.
 * It takes three properties:
 *      domain: The kmap domain--subjects, places, terms
 *      kid: The numberic kmaps id for the item in that domain
 *      placement: (optional) where to place the popover relative to the icon, defaults to 'below'.
 *                 Other values are: 'top', 'right', and 'left'.
 *
 *      Example:   <MandalaPopover
 *                      domain="subjects"
 *                      kid="8260"
 *                  />
 *
 *  Styling instructions for Popovers are in: ./views/css/Popover.scss which is included by call in App.js
 * @param props
 * @returns {*}
 * @constructor
 */
export function MandalaPopoverFullLoad(props) {
    //console.log("mandala popover props", props);
    // Basic Hooks
    const [show, setShow] = useState(false);
    const [byPass, setByPass] = useState(true);
    const target = useRef(null);

    // Props
    const domain = props.domain;
    const kid = props.kid;
    const placement = props.placement ? props.placement : 'bottom';
    const kmkey = props.mykey;
    const kmapid = props?.kmapid; // an asset solrdoc's kmapids from a tagged asset to add definitions for terms

    const opening = () => {
        setByPass(false);
        setShow(true);
    };

    const closing = () => {
        setShow(false);
    };

    let defs = false;
    if (domain === 'terms' && kmapid && kmapid.length > 0) {
        defs = kmapid.filter((kmid) => kmid.includes(`-${kid}_definitions`));
        defs = defs.map((kmid) => {
            return kmid.split('_definitions-')[1];
        });
    }

    // Query Custom Hooks (see hooks/useKmaps.js)
    // Info for Kmap Itself: kmapRes
    const {
        isIdle: kmapIsIdle,
        isLoading: kmapIsLoading,
        isError: kmapIsError,
        data: kmapRes,
        error: kmapError,
    } = useKmap(`${domain}-${kid}`, 'info', byPass);

    //console.log("kmap res:  " + domain + "-" + kid, kmapRes);

    // Info of Related Kmaps/Assets: relRes
    const {
        isIdle: relIsIdle,
        isLoading: relIsLoading,
        isError: relIsError,
        data: relRes,
        error: relError,
    } = useKmap(`${domain}-${kid}`, 'related', byPass);

    let isTib = '';
    let myhead = '';

    let kmapdata = [];
    let related = [];

    if (!kmapIsIdle || !relIsIdle) {
        //console.log('kmapdata', kmapRes);
        kmapdata = kmapRes;
        related = relRes;

        if (!kmapdata || !related) {
            return <>No data!</>;
        }
        isTib = kmapdata.tree == 'terms' && kmapdata.name_tibt;
        myhead = isTib ? kmapdata.name_tibt[0] : kmapdata.header;
    }

    let popoverLabel = '';
    let defspan = '';
    if (defs && defs.length > 0) {
        defspan = (
            <span className={'definitions'}>
                (
                {defs.map((defn) => {
                    return (
                        <Link
                            to={`/${domain}/${domain}-${kid}?def=${defn}`}
                            title={`Definition ${defn}`}
                        >
                            {defn}
                        </Link>
                    );
                })}
                )
            </span>
        );
    }

    if (props.children) {
        popoverLabel = (
            <span
                className="popover-link-custom"
                ref={target}
                onMouseOver={opening}
                onMouseOut={closing}
            >
                {props.children}
            </span>
        );
    } else {
        popoverLabel = (
            <>
                <span className={isTib ? 'u-bo' : ''}>{myhead}</span>
                {defspan}
                <span
                    className="popover-link"
                    ref={target}
                    onMouseOver={opening}
                    onMouseOut={closing}
                >
                    <span className="icon u-icon__kmaps-popover" />
                </span>
            </>
        );
    }

    // JSX
    return (
        <span
            key={kmkey}
            className="kmap-tag-group processed"
            data-kmdomain={domain}
            data-kmid={kid}
        >
            {popoverLabel}
            <Overlay target={target.current} show={show} placement={placement}>
                <Popover
                    data-kmid={kid}
                    className={'related-resources-popover processed'}
                    onMouseOver={() => setShow(true)}
                    onMouseOut={() => setShow(false)}
                >
                    <Popover.Title as="h5" className={isTib ? 'bo' : ''}>
                        {myhead} <span className={'kmid'}>{kid}</span>
                    </Popover.Title>
                    <Popover.Content>
                        <MandalaPopoverFullLoadBody
                            domain={domain}
                            kid={kid}
                            defs={defs}
                            info={kmapdata}
                            related={related}
                            kmapIsError={kmapIsError}
                            relIsError={relIsError}
                        />
                    </Popover.Content>
                </Popover>
            </Overlay>
        </span>
    );
}

function MandalaPopoverFullLoadBody(props) {
    if (props.kmapIsError || props.relIsError) {
        console.error(props.kmapIsError ? props.kmapError : props.relError);
        return <span className={'red'}>Error occurred ....</span>;
    }
    const kminfo = props.info;
    //console.log(kminfo);
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
        kminfo.tree == 'terms' && kminfo['ancestor_ids_tib.alpha']
            ? kminfo['ancestor_ids_tib.alpha']
            : kminfo.ancestor_ids_generic;
    const ancestor_labels =
        kminfo.tree == 'terms' && kminfo['ancestors_tib.alpha']
            ? kminfo['ancestors_tib.alpha']
            : kminfo.ancestors;
    if (ancestor_ids && ancestor_ids.length > 1) {
        const anclabel = kminfo.tree[0].toUpperCase() + kminfo.tree.substr(1);
        ancestors = (
            <div className="parents clearfix">
                <p>
                    <strong>{anclabel}</strong>&nbsp;
                    {ancestor_ids.map((aid, index) => {
                        if (index == ancestor_ids.length - 1) {
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
    if (kminfo.tree == 'terms' && kminfo.associated_subject_ids) {
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
                if (assettype == 'picture') {
                    return;
                }
                if (assettype == 'texts:pages') {
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
                                to={`/${domain}/${domain}-${kid}?def=${defn}`}
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
