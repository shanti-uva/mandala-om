import React, { useEffect, useState } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import poppng from '../../legacy/popover.png';
import ReactHtmlParser, { convertNodeToElement } from 'react-html-parser';

/**
 * MandalaHTMLPopover: Uses React Bootstrapts Overlay Trigger/Popover combo to display a kmap popover. There are two ways
 * to implement popovers. One can use the MandalaPopover component in the standard way:
 *
 *      <MandalaPopover
 *              placement="left|right|top|bottom"
 *              kmdomain="domain of kmap"
 *              kmid="kmaps number id"
 *              kmtitle="title for kmaps"
 *              kmcontent="the html for the body and footer of the kmap"
 *       />
 *
 * Or one can use the function HtmlWithPopovers(props) to convert kmap popovers embedded within HTML from an API. The
 * "props" parameter is an object with a single attribute "markup" set to the html markup to convert.
 *
 * @param props
 * @returns {*}
 * @constructor
 */
export function MandalaHTMLPopover(props) {
    const popover_icon = (
        <span className="popover-link">
            <span className="popover-link-tip" />
            <span className="icon shanticon-menu3" title={'Click to view'} />
        </span>
    );
    const placement = props.placement ? props.placement : 'bottom';

    return (
        <OverlayTrigger
            trigger={'click'}
            rootClose
            key={placement}
            placement={placement}
            overlay={
                <Popover
                    data-kmid={props.kmid}
                    className={'related-resources-popover'}
                >
                    <Popover.Title as="h5">
                        {props.kmtitle}{' '}
                        <span className={'kmid'}>{props.kmid}</span>
                    </Popover.Title>
                    <Popover.Content>
                        <PopoverHTMLBody content={props.kmcontent} />
                    </Popover.Content>
                </Popover>
            }
        >
            {popover_icon}
        </OverlayTrigger>
    );
}

function transform(node, index) {
    if (node.type === 'tag' && node.name === 'a') {
        const pubfolder = process.env.PUBLIC_URL;
        let lnkurl = node.attribs.href;
        node.attribs['href'] = '#';
        const mtch = lnkurl.search(/places|subjects|terms/);
        if (mtch > -1) {
            lnkurl =
                pubfolder + '/' + lnkurl.substring(mtch).replace('/nojs', '');
            node.attribs['href'] = lnkurl;
        } else {
            node.attribs['href'] = '#';
            node.attribs['data-url'] = lnkurl;
        }

        delete node.attribs['target'];
        return convertNodeToElement(node, index, transform);
    }
}

export function PopoverHTMLBody(props) {
    const cnthtml = props.content;

    const options = {
        decodeEntities: true,
        transform,
    };
    return (
        <div className={'react-popover-body'}>
            {ReactHtmlParser(cnthtml, options)}
        </div>
    );
}

/**
 * Element to return a simple html img element for the popover icon with no reactivity
 *
 * @param props
 * @returns {*}
 * @constructor
 */
export function PopoverIcon(props) {
    return <img src={poppng} title={'popover icon'} />;
}
