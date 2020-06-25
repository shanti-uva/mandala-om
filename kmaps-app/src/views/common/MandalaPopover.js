import React, {useEffect, useState} from 'react';
import 'html-to-react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import '../css/Popover.css';
import ReactHtmlParser from 'react-html-parser';

/**
 * MandalaPopovers: Uses React Bootstrapts Overlay Trigger/Popover combo to display a kmap popover
 * @param props
 * @returns {*}
 * @constructor
 */
export function MandalaPopover(props) {

    const popover_icon =  <span><span className="popover-link-tip" /><span className="icon shanticon-menu3" title={'Click to view'}/></span>;
    const placement = (props.placement) ? props.placement : 'bottom';
    const cnt = props.kmcontent;
    const cntprs = ReactHtmlParser(cnt);
    return (
        <OverlayTrigger
            trigger={'click'}
            rootClose
            key={placement}
            placement={placement}
            overlay={
                <Popover data-kmid={props.kmid} className={'related-resources-popover'} >
                    <Popover.Title as="h5">
                        {props.kmtitle} <span className={'kmid'}>{props.kmid}</span>
                    </Popover.Title>
                    <Popover.Content>
                        { cntprs }
                    </Popover.Content>
                </Popover>
            }
        >
            { popover_icon }
        </OverlayTrigger>
    );
}

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
    const processingInstructions = GetPopoverProcessingInstruction(processNodeDefs);
    const isValidNode = function () { return true; };
    const htmlToReactParser = new HtmlToReactParser();
    const htmlInput = (props.markup) ? props.markup : '<div></div>';
    const reactComponent = htmlToReactParser.parseWithInstructions(htmlInput, isValidNode, processingInstructions);
    return (
        <>{reactComponent}</>
    );
}

/**
 * The custom processing instruction for htmlToReactParser that identifies and react-ifies the popover markup
 *
 * @param processNodeDefs
 * @returns {({shouldProcessNode: (function(*): boolean), replaceChildren: boolean, processNode: (function(*, *): *)}|{shouldProcessNode: (function(*): boolean), processNode: processDefaultNode})[]}
 * @constructor
 */
export function GetPopoverProcessingInstruction(processNodeDefs) {
    return [
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
                return <MandalaPopover
                            kmid={kmpid}
                            kmdomain={kmpdom}
                            kmtitle={poptitle}
                            kmcontent={popcnt}
                        />;
            }
        },
        {
            // Anything else
            shouldProcessNode: function (node) {
                return true;
            },
            processNode: processNodeDefs.processDefaultNode
        }
    ]
}

/**
 * Custom function to convert the js node object tree from htmlToReactParser back into an html markup string
 * to be inserted into the dom. Used in the GetPopoverProcessingInstruction() to extract the popover body html
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
            if (el.attribs['class'] === 'popover' && atnm === 'style') { continue; }
            if (el.attribs['class'] === 'popover-body') {continue;}
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
