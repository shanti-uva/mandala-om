import { Link } from 'react-router-dom';
import * as PropTypes from 'prop-types';
import React from 'react';

export function KmapLink({ uid, label }) {
    const [type, id] = uid.split('-');
    return <Link to={'/' + type + '/' + uid}>{label}</Link>;
}

KmapLink.propTypes = {
    uid: PropTypes.string,
    label: PropTypes.string,
};
