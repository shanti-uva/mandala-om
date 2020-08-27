import * as PropTypes from 'prop-types';
import React from 'react';
import LinesEllipsis from 'react-lines-ellipsis';
import HTMLEllipsis from 'react-lines-ellipsis/lib/html';
import { renderToString } from 'react-dom/server';
import './SmartRelateds.css';

export function SmartRelateds(props) {
    return <div className={'c-smartRelateds__limited'}>{props.relateds}</div>;
}

SmartRelateds.propTypes = { relateds: PropTypes.any };
