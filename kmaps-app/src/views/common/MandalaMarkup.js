import React, { useEffect, useState } from 'react';
import ReactHtmlParser, { convertNodeToElement } from 'react-html-parser';
import { MandalaPopover } from './MandalaPopover';
import { MandalaModal } from './MandalaModal';

function transform(node, index) {
    // Process Popover Links in Mandala Markup
    if (node.attribs && node.attribs['class'] === 'kmap-tag-group') {
        const kmpdom = node.attribs['data-kmdomain'];
        const kmpid = node.attribs['data-kmid'];
        return <MandalaPopover domain={kmpdom} kid={kmpid} />;
    } // Process External Links in Mandala Markup to turn into Modals or Internal links TODO: Process internal Mandala links
    else if (
        node.name &&
        node.name === 'a' &&
        node.attribs &&
        node.attribs['href']
    ) {
        let linkurl = node.attribs['href'];
        let gotourl = linkurl;
        if (linkurl.indexOf('youtube.com') > -1) {
            linkurl = linkurl.replace('watch?v=', 'embed/');
            if (linkurl.indexOf('&t') > -1) {
                linkurl = linkurl.replace('&t', '?start');
                linkurl = linkurl.substring(0, linkurl.length - 1);
            }
        }
        let linkcontents = [];
        for (let n in node.children) {
            linkcontents.push(
                convertNodeToElement(node.children[n], index, transform)
            ); //elToHtml(node.children[n]);
        }
        let mytitle = node.attribs['title'] ? node.attribs['title'] : false;
        if (mytitle === false) {
            mytitle =
                typeof linkcontents[0] === 'string'
                    ? linkcontents[0].split(':')[0]
                    : 'No title';
        }
        const blocked = isBlockedUrl(linkurl);

        if (linkurl === '#') {
            return;
        } else if (linkurl[0] === '/' || blocked) {
            return (
                <a href={linkurl} target={'_blank'}>
                    {linkcontents}
                </a>
            );
        } else {
            return (
                <MandalaModal
                    url={linkurl}
                    gourl={gotourl}
                    title={mytitle}
                    text={linkcontents}
                />
            );
        }
    }
}

/**
 * a function that determines which urls are allowed to show in modal windows instead of new window
 *
 * @param lnkurl
 * @returns {boolean} : returns true if blocked from showing in modal
 */
function isBlockedUrl(lnkurl) {
    // ToDo: Check if there's a way to ping a url to see if it allows Iframing?
    // List of allowed domains for modal popups
    const allowed = ['.virginia.edu', 'youtube.com', 'vimeo.com'];
    for (let n in allowed) {
        let domstr = allowed[n];
        if (lnkurl.includes(domstr)) {
            return false;
        }
    }
    return true;
}

/**
 * Custom function to converts HTML from a Mandala App API into React Component using the MandalaPopover component for Popovers
 *
 * @param props
 * @returns {*}
 * @constructor
 */
export function HtmlWithPopovers(props) {
    const htmlInput = props.markup ? props.markup : '<div></div>';
    const options = {
        decodeEntities: true,
        preprocessNodes: function (nt) {
            for (let n in nt) {
                nt[n]['app'] = props.app ? props.app : false;
            }
            return nt;
        },
        transform,
    };

    return <>{ReactHtmlParser(htmlInput, options)}</>;
}

/**
 * The custom processing instruction for htmlToReactParser that identifies and react-ifies the popover markup
 *
 * @param processNodeDefs
 * @returns {({shouldProcessNode: (function(*): boolean), replaceChildren: boolean, processNode: (function(*, *): *)}|{shouldProcessNode: (function(*): boolean), processNode: processDefaultNode})[]}
 * @constructor
 */
export function GetMandalaProcessingInstruction(processNodeDefs) {
    return [
        /** Processing instruction to turn popover links into React MandalaPopover components **/
        {
            replaceChildren: true,
            shouldProcessNode: function (node) {
                return node.attribs && node.attribs['class'] === 'popover-link';
            },
            processNode: function (node, children) {},
        },
        /** Processing instruction to turn links in page into modal popups **/
        {
            replaceChildren: false,
            shouldProcessNode: function (node) {
                return (
                    node.name &&
                    node.name === 'a' &&
                    node.attribs &&
                    node.attribs['href']
                );
            },
            processNode: function (node, children) {},
        },
        /** Default processing instruction: leave node as is */
        {
            // Anything else
            shouldProcessNode: function (node) {
                return true;
            },
            processNode: processNodeDefs.processDefaultNode,
        },
    ];
}

/**
 * Custom function to convert the js node object tree from htmlToReactParser back into an html markup string
 * to be inserted into the dom. Used in the GetMandalaProcessingInstruction() to extract the popover body html
 *
 * @param el
 * @returns {string}
 */
function elToHtml(el) {
    let elout = '';
    if (el.type == 'tag') {
        elout = '<' + el.name;
        for (let atnm in el.attribs) {
            let attval = el.attribs[atnm];
            if (el.attribs['class'] === 'popover' && atnm === 'style') {
                continue;
            }
            if (el.attribs['class'] === 'popover-body') {
                continue;
            }
            //if (atnm === 'style') { attval = attval.replace('display: none;',''); }
            elout += ' ' + atnm + '="' + attval + '"';
        }
        elout += '>';
        for (let n in el.children) {
            elout += elToHtml(el.children[n]);
        }
        elout += '</' + el.name + '>';
    } else if (el.type == 'text') {
        elout = el.data;
    }
    return elout;
}
