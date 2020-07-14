import React, { useEffect, useState } from 'react';
import 'html-to-react';
import { MandalaPopover } from './MandalaPopover';
import { MandalaModal } from './MandalaModal';

/**
 * Custom function to converts HTML from a Mandala App API into React Component using the MandalaPopover component for Popovers
 *
 * @param props
 * @returns {*}
 * @constructor
 */
export function HtmlWithPopovers(props) {
    const HtmlToReact = require('html-to-react');
    const HtmlToReactParser = HtmlToReact.Parser;
    const processNodeDefs = new HtmlToReact.ProcessNodeDefinitions(React);
    const processingInstructions = GetMandalaProcessingInstruction(
        processNodeDefs
    );
    const isValidNode = function () {
        return true;
    };
    const htmlToReactParser = new HtmlToReactParser();
    const htmlInput = props.markup ? props.markup : '<div></div>';
    const reactComponent = htmlToReactParser.parseWithInstructions(
        htmlInput,
        isValidNode,
        processingInstructions
    );
    return <>{reactComponent}</>;
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
            processNode: function (node, children) {
                const kmpdom = node.parent.attribs['data-kmdomain'];
                const kmpid = node.parent.attribs['data-kmid'];
                const popel = node.parent.next.next;
                const poptitle = popel.attribs['data-title'];
                let popcnt = '';
                for (let n in popel.children) {
                    popcnt += elToHtml(popel.children[n]);
                }
                return (
                    <MandalaPopover
                        kmid={kmpid}
                        kmdomain={kmpdom}
                        kmtitle={poptitle}
                        kmcontent={popcnt}
                    />
                );
            },
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
            processNode: function (node, children) {
                let linkurl = node.attribs['href'];
                if (linkurl.indexOf('youtube.com')) {
                    linkurl = linkurl.replace('watch?v=', 'embed/');
                }
                let linkcontents = '';
                for (let n in node.children) {
                    linkcontents += elToHtml(node.children[n]);
                }
                const mytitle = node.attribs['title']
                    ? node.attribs['title']
                    : linkcontents.split(':')[0];
                if (linkurl === '#') {
                    return processNodeDefs.processDefaultNode;
                } else {
                    return (
                        <MandalaModal
                            url={linkurl}
                            title={mytitle}
                            text={linkcontents}
                        />
                    );
                }
            },
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
