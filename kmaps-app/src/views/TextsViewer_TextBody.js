import React from 'react';
import {Parser} from "html-to-react";
import Col from 'react-bootstrap/Col';

export default function TextBody(props) {
    // console.log("text body props", props);
    // ReactDOMServer.renderToStaticMarkup(props.markup)
    const parser = new Parser();  // html-to-jsx parser
    const render_text = (props.markup) ? parser.parse( props.markup ) : '';
    return (
        <Col id={'shanti-texts-body'}>
            {render_text}
        </Col>
    );
}