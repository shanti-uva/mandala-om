import { Link } from 'react-router-dom';
import * as PropTypes from 'prop-types';
import React from 'react';

export function KmapLink({ uid, label, key }) {
    const [type, id] = uid.split('-');

    if (!key) {
        key = uid;
    }
    return (
        <Link key={key} to={'/' + type + '/' + uid}>
            {label}
        </Link>
    );
}

KmapLink.propTypes = {
    uid: PropTypes.string,
    label: PropTypes.string,
};
