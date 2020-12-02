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
export function MandalaPopover(props) {
    //console.log("mandala popover props", props);
    // Basic Hooks
    const [show, setShow] = useState(false);
    const target = useRef(null);

    // Props
    const domain = props.domain;
    const kid = props.kid;
    const placement = props.placement ? props.placement : 'bottom';
    const kmkey = props.mykey;
    const defs = props?.defs;

    // Query Custom Hooks (see hooks/useKmaps.js)
    // Info for Kmap Itself: kmapRes
    const {
        isLoading: kmapIsLoading,
        isError: kmapIsError,
        data: kmapRes,
        error: kmapError,
    } = useKmap(domain, kid, 'info');

    //console.log("kmap res:  " + domain + "-" + kid, kmapRes);

    // Info of Related Kmaps/Assets: relRes
    const {
        isLoading: relIsLoading,
        isError: relIsError,
        data: relRes,
        error: relError,
    } = useKmap(domain, kid, 'related');

    if (kmapIsLoading || relIsLoading) {
        return <span>Loading ....</span>;
    }
    if (kmapIsError || relIsError) {
        console.error(kmapIsError ? kmapError : relError);
        return <span className={'red'}>Error occurred ....</span>;
    }
    //console.log('kmapdata', kmapRes);
    const kmapdata = kmapRes;
    const related = relRes;

    if (!kmapdata || !related) {
        return <>No data!</>;
    }
    const isTib = kmapdata.tree == 'terms' && kmapdata.name_tibt;
    const myhead = isTib ? kmapdata.name_tibt[0] : kmapdata.header;
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
                onMouseOver={() => setShow(true)}
                onMouseOut={() => setShow(false)}
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
                    onMouseOver={() => setShow(true)}
                    onMouseOut={() => setShow(false)}
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
                        <MandalaPopoverBody
                            domain={domain}
                            kid={kid}
                            defs={defs}
                            info={kmapdata}
                            related={related}
                        />
                    </Popover.Content>
                </Popover>
            </Overlay>
        </span>
    );
}

function MandalaPopoverBody(props) {
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

/**
 * A test function returned from the path in ContentMain.js. Path is: /poptest/{domain}/{kid}
 *
 * @param props
 * @returns {*}
 * @constructor
 */
export function MandalaPopoverTest(props) {
    const domain = props.match.params.dom;
    const kid = props.match.params.kid;
    const kdata = useKmap(domain, kid, 'info');
    const kmapdata = JSON.stringify(kdata, null, 4);
    const placement = props.placement ? props.placement : 'bottom';
    const testdivstyle = {
        margin: '20px',
        border: 'thin dashed green',
        padding: '15px',
        backgroundColor: '#e1eff3',
        maxWidth: '98vw',
    };
    const base_url = process.env.PUBLIC_URL + '/poptest/{}';
    return (
        <>
            <Container fluid id={'mptestdiv'} style={testdivstyle}>
                <Row>
                    <h1 style={{ marginLeft: '10px' }}>
                        Mandala Popover React Test
                    </h1>
                </Row>
                <Row>
                    <Col md={'4'}>
                        <p>
                            We’re rolling along in the text, when we cite a kamp
                            term,
                            <MandalaPopover
                                domain={domain}
                                kid={kid}
                                placement={placement}
                            />{' '}
                            Magnis turpis inceptos nostrud malesuada, faucibus
                            excepteur modi laboriosam, commodi suscipit viverra?
                        </p>
                        <p>
                            Now this is the mandala inline popover test:{' '}
                            <MandalaPopover
                                domain={'subjects'}
                                kid={'442'}
                                placement={placement}
                            >
                                <PopTestComp label={'Bologna'} type={'fire'} />
                            </MandalaPopover>{' '}
                            The whale has no famous author, and whaling no
                            famous chronicler, you will say.{' '}
                            <MandalaPopover
                                domain={'subjects'}
                                kid={'4481'}
                                placement={'top'}
                            >
                                <PopTestComp
                                    label={'housewife'}
                                    type={'zelda'}
                                />
                            </MandalaPopover>{' '}
                            The Pequod had now swept so nigh to the stranger,
                            that Stubb vowed he recognised his cutting
                            spade-pole entangled in the lines that were knotted
                            round the tail of one of these whales.{' '}
                            <MandalaPopover
                                domain={'subjects'}
                                kid={'2191'}
                                placement={'right'}
                            >
                                <PopTestComp
                                    label={'what’s right?'}
                                    type={'tree'}
                                />
                            </MandalaPopover>{' '}
                        </p>
                        <p>
                            Faucibus excepteur modi laboriosam, commodi suscipit
                            viverra?
                            <MandalaPopover
                                domain={'terms'}
                                kid={'85193'}
                                placement={'top'}
                            />{' '}
                            Duis amet. Suspendisse numquam? Incididunt mollitia,
                            perspiciatis penatibus.
                        </p>
                        <p>Other well-known kmaps:</p>
                        <ul>
                            <li>
                                <a href={base_url.replace('{}', 'places/637')}>
                                    Lhasa
                                </a>
                            </li>
                            <li>
                                <a
                                    href={base_url.replace(
                                        '{}',
                                        'subjects/8260'
                                    )}
                                >
                                    Bhutan Cultural Library
                                </a>
                            </li>
                            <li>
                                <a
                                    href={base_url.replace('{}', 'terms/85193')}
                                    className={'bo'}
                                >
                                    ཐོད་རྒལ་
                                </a>
                            </li>
                        </ul>
                    </Col>
                    <Col md={'8'}>
                        <button
                            id="showbutt"
                            onClick={() => {
                                const me = document.getElementById('showbutt');
                                const prel = document.getElementById('precode');
                                if (prel.style.display == 'none') {
                                    prel.style.display = 'block';
                                    me.innerText = 'Hide Kmaps Data';
                                } else {
                                    prel.style.display = 'none';
                                    me.innerText = 'Show Kmaps Data';
                                }
                            }}
                        >
                            Show Kmaps Data
                        </button>
                        <pre
                            id="precode"
                            style={{
                                display: 'none',
                                border: 'thick outset lightblue',
                                padding: '10px',
                                backgroundColor: 'white',
                                fontFamily: 'verdana',
                                fontSize: '10pt',
                            }}
                        >
                            {kmapdata}
                        </pre>
                    </Col>
                </Row>
            </Container>
            {/* <ReactQueryDevtools initialIsOpen />*/}
        </>
    );
}

function PopTestComp(props) {
    const label = props.label;
    const imgs = {
        rose: 'https://www.gstatic.com/webp/gallery3/1.sm.png',
        fire: 'https://www.gstatic.com/webp/gallery/5.sm.jpg',
        valley: 'https://www.gstatic.com/webp/gallery/1.sm.jpg',
        rapids: 'https://www.gstatic.com/webp/gallery/2.sm.jpg',
        peppers: 'https://homepages.cae.wisc.edu/~ece533/images/peppers.png',
        zelda: 'https://homepages.cae.wisc.edu/~ece533/images/zelda.png',
        tree: 'https://www.gstatic.com/webp/gallery/4.sm.jpg',
        error:
            'https://cdn.freshdesignweb.com/wp-content/uploads/site/Free-404-Error-Page-Responsive-website-Template.jpg',
    };
    const imgtype = props.type in imgs ? props.type : 'error';

    return (
        <div className={'inline'}>
            <span
                style={{
                    fontStyle: 'italic',
                    color: 'blue',
                    paddingRight: '2px',
                }}
            >
                {label}
            </span>
            <img
                src={imgs[imgtype]}
                style={{
                    height: '80px',
                    display: 'inline',
                }}
            />
        </div>
    );
}
