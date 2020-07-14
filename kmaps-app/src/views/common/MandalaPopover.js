import React, { useEffect, useState } from 'react';
import 'html-to-react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import poppng from '../../legacy/popover.png';
import { HtmlWithPopovers } from './MandalaMarkup';

import ReactHtmlParser from 'react-html-parser';

/**
 * MandalaPopovers: Uses React Bootstrapts Overlay Trigger/Popover combo to display a kmap popover. There are two ways
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
export function MandalaPopover(props) {
    const popover_icon = (
        <span>
            <span className="popover-link-tip" />
            <span className="icon shanticon-menu3" title={'Click to view'} />
        </span>
    );
    const placement = props.placement ? props.placement : 'bottom';
    const cnt = props.kmcontent;
    const cntprs = ReactHtmlParser(cnt);
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
                    <Popover.Content>{cntprs}</Popover.Content>
                </Popover>
            }
        >
            {popover_icon}
        </OverlayTrigger>
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
