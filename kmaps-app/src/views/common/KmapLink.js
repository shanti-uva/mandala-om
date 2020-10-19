import { Link } from 'react-router-dom';
import * as PropTypes from 'prop-types';
import React from 'react';

export function KmapLink({ uid, label, key, className }) {
    const [type, id] = uid.split('-');

    if (!key) {
        key = uid;
    }

    if (id == 'collection') {
        const pts = uid.split('-');
        const cid = pts.pop();
        const ctype = pts.join('-');
        return (
            <Link className={className} key={key} to={'/' + ctype + '/' + cid}>
                {label}
            </Link>
        );
    }

    return (
        <Link className={className} key={key} to={'/' + type + '/' + uid}>
            {label}
        </Link>
    );
}

KmapLink.propTypes = {
    uid: PropTypes.string,
    label: PropTypes.string,
};
