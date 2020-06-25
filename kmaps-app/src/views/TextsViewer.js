import React, {useEffect, useState} from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import TextBody from "./TextsViewer_TextBody";
import TextTabs from "./TextsViewer_TextTabs";
import './css/AssetViewer.css';
import './css/TextViewer.css';
import './css/ShantiTexts.css';
import Spinner from 'react-bootstrap/Spinner';

import $ from 'jquery';

/**
 * Text Viewer Component: The parent component for viewing a text. Gets sent the asset information as a prop
 * called "mdlasset" from MdlAssetContext.js. When there is asset information, it creates a bootstrap container
 * with one row that contains a TextBody (TextsViewer_TextBody.js) component and a TextTabs (TextsViewer_TextTabs.js)
 * component.
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
    const pgid = props.id;
    const tid = (props.mdlasset) ? props.mdlasset.nid : '';
    const [text_sections, setSections] = useState([]);
    const [section_showing, setSectionShowing] = useState(['shanti-texts-' + tid]);

    // Setting text_sections variable with array of sections in text
    // TODO: Assess whether this is still necessary
    useEffect(() => {
        // Set the text section state var if empty. Only need to do once on load
        if (text_sections.length == 0 && $('#shanti-texts-body .shanti-texts-section').length > 0) {
            const sections_tmp = $('#shanti-texts-body .shanti-texts-section').toArray();
            const sections_new = $.map(sections_tmp, function(s, n) {
                const sel = $(s);
                let nexttop =  1000000;
                if (n < sections_tmp.length + 1) {
                    const nxtoffset = $(sections_tmp[n + 1]).offset();
                    if(nxtoffset && nxtoffset.top) {
                        nexttop = nxtoffset.top - 145;
                    }
                }
                return {
                    el: sel,
                    id: sel.attr('id'),
                    title: $.trim(sel.children().eq(0).text()),
                    getTop: function() { return this.el.offset().top; }
                };
            });
            setSections(sections_new);
            const firstlink = $('.shanti-texts-toc > ul > li.first > a');
            firstlink.addClass('toc-selected');
        }
    });  // End of sections effect

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
        $.each(text_sections, function(m) {
            const s = text_sections[m];
            const nxts = (m < text_sections.length - 1) ? text_sections[m + 1] : false;
            const stop = s.getTop();
            const nxttop = (nxts) ? nxts.getTop() : 10000000;
            if ((stop > mytop && stop < mybottom) || (stop < mytop && nxttop > mytop)) {
                vissect.push(s.id);
                const lnkid = '#' + s.id.replace('texts-', 'texts-toc-');
                $(lnkid).addClass('toc-selected');
            }
        });
        setSectionShowing(vissect);
    };

    // Declare output variable with loading markup (Not used because overwritten
    let output = (
        <Container className={'astviewer texts'} fluid>
            <Row id={'shanti-texts-container'}>
               <div className="loading">
                    <Spinner
                        as="div"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true">
                    </Spinner>
                    Loading text...
               </div>
                <div className={ 'not-found-msg hidden' }>
                    <h1>Text Not Found!</h1>
                    <p className={'error'}>Could not find the requested text: {props.id}</p>
                </div>
            </Row>
        </Container>
    );
    // Set output to return. If there's an asset, then output with text BS Container with one BS Row
    // Row contains: TextBody (main part of text) and Text Tabs (Collapsible tabs on right side including TOC)
    if (props.mdlasset && props.mdlasset.nid) {
        const currast = props.mdlasset;
        output =
            <Container className={'astviewer texts'} fluid>
                <Row id={'shanti-texts-container'}>
                    <TextBody id={props.mdlasset.nid}
                              alias={props.mdlasset.alias}
                              markup={currast.full_markup}
                              listener={handleScroll}
                    />
                    <TextTabs toc={currast.toc_links}
                              meta={currast.bibl_summary}
                              links={currast.views_links}
                              title={currast.title}
                              sections={section_showing}
                    />
                </Row>
            </Container>;
    }
    return output;
}