import React from 'react';
import 'html-to-react';
import {HtmlWithPopovers} from './common/MandalaPopover';
import Col from 'react-bootstrap/Col';

export default function TextBody(props) {
    const txt_link = props.alias;
    return (
        <Col id={'shanti-texts-body'} onScroll={props.listener}>
            <div className={'link-external'}>
                <a href={txt_link} target={'_blank'} title={'View Text in Mandala'}>
                    <span className={'shanticon shanticon-link-external'}></span>
                </a>
            </div>
            <HtmlWithPopovers markup={props.markup} />
        </Col>
    );
}