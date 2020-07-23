import React, { useEffect, useState } from 'react';
import { Parser } from 'html-to-react';
import Col from 'react-bootstrap/Col';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Collapse from 'react-bootstrap/Collapse';
import { HtmlWithPopovers } from './common/MandalaMarkup';
import $ from 'jquery';

export default function TextTabs(props) {
    const parser = new Parser();
    const toc_code = parser.parse(props.toc);
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
    const site_base = window.location.href.split('/texts/')[0] + '/texts/';
    // Massage views for voyant and pub reader to use react app as host
    const links_html = props.links
        .replace(/href="\//g, 'href="' + site_base)
        .replace('shanti_texts', '')
        .replace('texts//', 'texts/');

    useEffect(() => {
        var ablanks = $(
            '#shanti-texts-sidebar-tabs-tabpane-text_links a[target="_blank"]'
        );
        ablanks.each(function () {
            const ltitle = $(this).attr('title');
            if (typeof ltitle === 'string') {
                if (
                    ltitle.indexOf('Voyant') > -1 ||
                    ltitle.indexOf('Reader') > -1
                ) {
                    $(this).attr('target', '');
                }
            }
        });
    });

    //console.log("meta received", props);
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
                            {toc_code}
                        </Tab>
                        <Tab eventKey={'text_bibl'} title={'Description'}>
                            <HtmlWithPopovers markup={props.meta} />
                            {/* parser.parse(props.meta) */}
                        </Tab>
                        <Tab eventKey={'text_links'} title={'Views'}>
                            {parser.parse(links_html)}
                        </Tab>
                    </Tabs>
                </Col>
            </Collapse>
        </>
    );
}
