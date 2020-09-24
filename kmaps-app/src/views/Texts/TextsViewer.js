import React, { useEffect, useState } from 'react';
import useStatus from '../../hooks/useStatus';
import {
    Container,
    Col,
    Row,
    Spinner,
    Collapse,
    Tabs,
    Tab,
} from 'react-bootstrap';
import { HtmlWithPopovers, getRandomKey } from '../common/MandalaMarkup';
import { addBoClass } from '../common/utils';
import './TextsViewer.sass';
import $ from 'jquery';

/**
 * Text Viewer Component: The parent component for viewing a text. Gets sent the asset information as a prop
 * called "mdlasset" from MdlAssetContext.js. When there is asset information, it creates a bootstrap container
 * with one row that contains a TextBody component and a TextTabs component (Both defined in this file).
 *
 * Uses State and Effect to keep track of which section(s) is/are visible in the scrolling body and passes this
 * information to the TextTabs component so it can highlight the active part of the TOC.
 *
 * State Variables:
 *      text_sections => an array of objects about the sections of the text each object has:
 *          el : the jQuery element
 *          id : the html ID value for the section <div>
 *          title : the title for that section
 *          top: the offset top of the element within its container
 *          bottom: the offset top of the next element or 1000000 if last element
 *
 *      section_showing => a simple array of strings which are IDs for the sections visible in the
 *                         main body's viewport.
 *
 * @param props
 * @returns {*}
 * @constructor
 */
export function TextsViewer(props) {
    const nodejson = props.nodejson ? props.nodejson : '';
    const kmasset = props.mdlasset ? props.mdlasset : '';
    const tid = nodejson ? nodejson.nid : '';
    const title = nodejson ? nodejson.title : '';
    const ismain = props.ismain ? props.ismain : false;

    const [text_sections, setSections] = useState([]);
    const [section_showing, setSectionShowing] = useState([
        'shanti-texts-' + tid,
    ]);
    const [alt_viewer_url, setAltViewerUrl] = useState(''); // alt_viewer has url for alt view to show if showing or empty string is hidden

    const status = useStatus();

    // Effect to change banner and title if the viewer is the main component
    useEffect(() => {
        if (ismain) {
            status.setType('texts');
            const mytitle = kmasset.title ? kmasset.title : 'Loading ...';
            if (mytitle) {
                status.setHeaderTitle(mytitle);
            }
        }
    }, [kmasset]);

    // Add Custom Body Class for Text component (one time) and timeout to show not found div
    useEffect(() => {
        // add class "texts" to the main div for CSS styles
        $('.l-site__wrap').addClass('texts');

        // Show not found div if it still exists after 10 seconds.
        setTimeout(function () {
            $('.not-found-msg').removeClass('d-none');
        }, 10000);
    }, []);

    // Setting text_sections variable with array of sections in text for TOC highlighting on scrolling and
    // also highlights first TOC link
    useEffect(() => {
        // Set the text section state var if empty. Only need to do once on load
        if (
            text_sections.length == 0 &&
            $('#shanti-texts-body .shanti-texts-section').length > 0
        ) {
            // Get all sections in text
            const sections_tmp = $(
                '#shanti-texts-body .shanti-texts-section'
            ).toArray();

            // Map Section array to an array of standardized objects with el, id, title, and getTop() function
            const sections_new = $.map(sections_tmp, function (s, n) {
                const sel = $(s);
                let nexttop = 1000000;
                if (n < sections_tmp.length + 1) {
                    const nxtoffset = $(sections_tmp[n + 1]).offset();
                    if (nxtoffset && nxtoffset.top) {
                        nexttop = nxtoffset.top - 145;
                    }
                }
                return {
                    el: sel,
                    id: sel.attr('id'),
                    title: $.trim(sel.children().eq(0).text()),
                    getTop: function () {
                        return this.el.offset().top;
                    },
                };
            });
            // Set Sections state to array of section objects
            setSections(sections_new);

            // Highlight first link in TOC
            const myhash = window.location.hash;
            const mytochash = myhash.replace(
                'shanti-texts-',
                'shanti-texts-toc-'
            );
            let firstlink = $('.shanti-texts-toc > ul > li.first > a');
            if (
                myhash &&
                $('.shanti-texts-toc > ul  a' + mytochash).length === 1
            ) {
                firstlink = $('.shanti-texts-toc > ul  a' + mytochash);
                $(myhash).get(0).scrollIntoView();
            }
            firstlink.addClass('toc-selected');
        }
    }); // End of sections effect

    /**
     * Handle scroll of the main text window to determine which sections are in viewport (i.e. showing)
     * Update state var section_showing (an array of section IDs showing) to pass to TOC for highlighting
     * This is passed to TextBody as prop called "listener" (Is that an unwise choice of variable name?)
     *
     * @param e : not used event object (remove?)
     */
    const handleScroll = (e) => {
        const mytop = 90;
        const mybottom = mytop + $('#shanti-texts-body').height();
        let vissect = [];
        $('.toc-selected').removeClass('toc-selected');
        $.each(text_sections, function (m) {
            const s = text_sections[m];
            const nxts =
                m < text_sections.length - 1 ? text_sections[m + 1] : false;
            const stop = s.getTop();
            const nxttop = nxts ? nxts.getTop() : 10000000;
            if (
                (stop > mytop && stop < mybottom) ||
                (stop < mytop && nxttop > mytop)
            ) {
                vissect.push(s.id);
                const lnkid = '#' + s.id.replace('texts-', 'texts-toc-');
                $(lnkid).addClass('toc-selected');
            }
        });
        setSectionShowing(vissect);
    };

    // Declare output variable with loading markup (Not used because overwritten
    let output = (
        <>
            <Container className={'astviewer texts'} fluid>
                <Row id={'shanti-texts-container'}>
                    <div className="loading">
                        <Spinner
                            as="div"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        ></Spinner>
                        Loading text...
                    </div>
                    <div className={'not-found-msg d-none'}>
                        <h1>Text Not Found!</h1>
                        <p className={'error'}>
                            Could not find the requested text: {props.id}
                        </p>
                    </div>
                </Row>
            </Container>
        </>
    );

    // Set output to return. If there's an asset, then output with text BS Container with one BS Row
    // Row contains: TextBody (main part of text) and Text Tabs (Collapsible tabs on right side including TOC)
    if (nodejson && nodejson.nid) {
        //console.log("Currast", currast);
        if (nodejson.bibl_summary === '') {
            nodejson.bibl_summary = '<div>Description is loading!</div>';
        }
        output = (
            <>
                <Container className={'astviewer texts'} fluid>
                    <Row id={'shanti-texts-container'}>
                        <TextBody
                            id={nodejson.nid}
                            alias={nodejson.alias}
                            markup={nodejson.full_markup}
                            listener={handleScroll}
                        />
                        <TextTabs
                            toc={nodejson.toc_links}
                            meta={nodejson.bibl_summary}
                            links={nodejson.views_links}
                            title={title}
                            sections={section_showing}
                            altChange={setAltViewerUrl}
                        />
                    </Row>
                </Container>
                <TextsAltViewer
                    title={title}
                    url={alt_viewer_url}
                    altChange={setAltViewerUrl}
                />
                {/* <ReactQueryDevtools initialIsOpen /> */}
            </>
        );
    }
    return output;
}

/**
 *
 * @param props
 * @returns {*}
 * @constructor
 */
function TextBody(props) {
    const txt_link = props.alias;

    // Adjust CSS for Texts only
    useEffect(() => {
        $(
            '.l-content__wrap, #l-content__main,.astviewer, .astviewer.texts #shanti-texts-container'
        ).css('height', 'inherit');
    }, []);

    useEffect(() => {
        addBoClass('#l-content__main');
    });

    return (
        <Col id={'shanti-texts-body'} onScroll={props.listener}>
            <div className={'link-external mandala-edit-link'}>
                <a
                    href={txt_link}
                    target={'_blank'}
                    title={'View Text in Mandala'}
                >
                    <span className={'icon u-icon__external'}></span>
                </a>
            </div>
            <HtmlWithPopovers markup={props.markup} />
        </Col>
    );
}

/**
 *
 * @param props
 * @returns {*}
 * @constructor
 */
function TextTabs(props) {
    /*const parser = new Parser();
    const toc_code = parser.parse(props.toc);*/
    const info_icon = <span className={'shanticon shanticon-info'}></span>;
    const collapse_icon = (
        <span className={'shanticon shanticon-circle-right'}></span>
    );
    const [open, setOpen] = useState(true);
    const [icon, setIcon] = useState(collapse_icon);
    const toggle_col = () => {
        setOpen(!open);
    };
    const update_icon = () => {
        let new_icon = open ? collapse_icon : info_icon;
        setIcon(new_icon);
    };

    const tabshtml = $(props.links);
    const htmllinks = tabshtml.find('a');
    const linkscomp = htmllinks.map((n, item) => {
        let href = $(item).attr('href');
        if (!href.includes('http')) {
            href = process.env.REACT_APP_DRUPAL_TEXTS + href;
        }
        const mytxt = $(item).text();
        const mykey = getRandomKey(mytxt);
        return (
            <tr className="shanti-texts-field nothing" key={mykey}>
                <td colSpan="2" className="shanti-texts-field-content">
                    <a
                        href="#"
                        data-href={href}
                        onClick={() => {
                            props.altChange(href);
                        }}
                    >
                        {mytxt}
                    </a>
                </td>
            </tr>
        );
    });
    const title = props.title;

    return (
        <>
            <div id={'sidecolumn-ctrl'}>
                <a
                    onClick={toggle_col}
                    aria-controls="txtsidecol"
                    aria-expanded="open"
                    className={'sidecol-toggle'}
                >
                    {icon}
                </a>
            </div>
            <Collapse in={open} onExited={update_icon} onEnter={update_icon}>
                <Col id={'shanti-texts-sidebar'} md={4}>
                    <Tabs
                        id={'shanti-texts-sidebar-tabs'}
                        className={'nav-justified'}
                    >
                        <Tab
                            eventKey={'text_toc'}
                            title={'Contents'}
                            className={'shanti-texts-toc'}
                        >
                            <div className={'shanti-texts-record-title'}>
                                <a href={'#shanti-top'}>{props.title}</a>
                            </div>
                            <HtmlWithPopovers
                                markup={props.toc}
                                app={'texts'}
                            />
                        </Tab>
                        <Tab eventKey={'text_bibl'} title={'Description'}>
                            <HtmlWithPopovers
                                markup={props.meta}
                                app={'texts'}
                            />
                        </Tab>
                        <Tab eventKey={'text_links'} title={'Views'}>
                            <div className="shanti-texts-record-title">
                                {title}
                            </div>
                            <h6>Alternative Formats</h6>
                            <div>
                                <table className="shanti-texts-record-table table">
                                    <tbody>{linkscomp}</tbody>
                                </table>
                            </div>
                        </Tab>
                    </Tabs>
                </Col>
            </Collapse>
        </>
    );
}

/**
 * Text Alt viewer provides the IFrame to show the alternative views in an Iframe
 *
 * @param props
 * @returns {*}
 * @constructor
 */
function TextsAltViewer(props) {
    const iframe_url = props.url ? props.url : '';
    const clname = iframe_url ? 'hidden' : 'shown';
    const text_title = props.title ? props.title : '';
    const iframe = iframe_url ? (
        <iframe src={iframe_url} className={'full-page-frame'} />
    ) : (
        ' '
    );
    return (
        <div id={'text-alt-viewer'} className={clname}>
            <div className={'close-iframe'}>
                <a
                    href="#"
                    title={'Back to ' + text_title}
                    onClick={() => {
                        props.altChange('');
                    }}
                >
                    <span className={'icon shanticon-cancel'}></span>
                </a>
            </div>
            {iframe}
        </div>
    );
}
