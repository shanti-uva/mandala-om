import React, { useEffect } from 'react';
import 'html-to-react';
import { HtmlWithPopovers } from './common/MandalaPopover';
import Col from 'react-bootstrap/Col';
import $ from 'jquery';

export default function TextBody(props) {
    const txt_link = props.alias;

    // Adjust CSS for Texts only
    useEffect(() => {
        $(
            '.sui-content, #sui-results,.astviewer, .astviewer.texts #shanti-texts-container'
        ).css('height', 'inherit');
    }, []);

    return (
        <Col id={'shanti-texts-body'} onScroll={props.listener}>
            <div className={'link-external mandala-edit-link'}>
                <a
                    href={txt_link}
                    target={'_blank'}
                    title={'View Text in Mandala'}
                >
                    <span
                        className={'shanticon shanticon-link-external'}
                    ></span>
                </a>
            </div>
            <HtmlWithPopovers markup={props.markup} />
        </Col>
    );
}
