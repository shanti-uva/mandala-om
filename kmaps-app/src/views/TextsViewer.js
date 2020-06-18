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
 * TODO: Need to get TOC to highlight appropriate sections
 * TODO: Need to keep track of selected TOC component and make main window scroll to that.
 *
 * @param props
 * @returns {*}
 * @constructor
 */
export function TextsViewer(props) {
    //console.log("TV Props", props);
    const tid = props.mdlasset.nid;
    const [text_sections, setSections] = useState([]);
    const [section_showing, setSectionShowing] = useState(['shanti-texts-' + tid]);
    useEffect(() => {
        // Set the text section state var if empty. Only need to do once on load
        if (text_sections.length == 0) {
            const sections_tmp = $('#shanti-texts-body .shanti-texts-section').toArray();
            const sections_new = $.map(sections_tmp, function(s, n) {
                const sel = $(s);
                let nexttop =  1000000;
                if (n < sections_tmp.length + 1) {
                    const nxtoffset = $(sections_tmp[n + 1]).offset();
                    if(nxtoffset && nxtoffset.top) {
                        nexttop = nxtoffset.top;
                    }
                }
                return {
                    el: sel,
                    id: sel.attr('id'),
                    title: $.trim(sel.children().eq(0).text()),
                    top: sel.offset().top,
                    bottom: nexttop
                };
            });
            setSections(sections_new);
        }
    });

    /**
     * Handle scroll of the main text window to determine which sections are in viewport (i.e. showing)
     * Update state var section_showing (an array of section IDs showing) to pass to TOC for highlighting
     * This is passed to TextBody as prop called "listener" (Is that an unwise choice of variable name?)
     *
     * @param e : not used event object (remove?)
     */
    const handleScroll = (e) => {
        //console.log(text_sections);
        const mytop = $('#shanti-texts-body').scrollTop();
        const mybottom = mytop + $('#shanti-texts-body').height();
        let vissect = [];
        $.each(text_sections, function(m) {
            const s = text_sections[m];
            if ((s.top > mytop && s.top < mybottom) || (s.top < mytop && s.bottom > mytop)) {
                vissect.push(s.id);
            }
        });
        setSectionShowing(vissect);
    };

    // Set output to return, first default loading markup
    let output = <div className={'astviewer'}>
            <Spinner
                as="div"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true">
            </Spinner>
            Loading text...
        </div>;
    // If there's an asset, they redo output with text BS Container with one BS Row
    // Row contains: TextBody (main part of text) and Text Tabs (Collapsible tabs on right side including TOC)
    if (props.mdlasset && props.mdlasset.nid) {
        const currast = props.mdlasset;
        //console.log("Currast", currast);
        output =
            <Container className={'astviewer texts'} fluid>
                <Row id={'shanti-texts-container'}>
                    <TextBody markup={currast.full_markup} listener={handleScroll}/>
                    <TextTabs toc={currast.toc_links}
                              meta={currast.bibl_summary}
                              links={currast.views_links}
                              title={currast.title}
                              section={section_showing}
                    />
                </Row>
            </Container>;
    }
    return output;
}