import React from 'react';
import _ from 'lodash';
import './TermDefinitionsDetails.css';

const TermDefinitionsDetails = ({ def }) => {
    const details = _.reduce(
        def,
        (accum, value, key) => {
            const matches = key.match(
                /^related_definitions_branch_subjects-(\d+)_(\w+)/
            );
            if (matches?.length > 0) {
                accum[matches[1]] = accum[matches[1]] || {};
                switch (matches[2]) {
                    case 'header_s':
                        accum[matches[1]]['header_title'] = value;
                        break;
                    case 'subjects_headers_t':
                        accum[matches[1]]['header_text'] = value;
                        break;
                    case 'subjects_uids_t':
                        accum[matches[1]]['header_uids'] = value;
                        break;
                    default:
                        break;
                }
            }
            return accum;
        },
        {}
    );
    return (
        <div className="sui-termDefDetailsWrapper">
            {Object.keys(details).map((key) => (
                <div key={key} className="sui-termDefDetails__item">
                    <span className="sui-termDefDetails__title">
                        {details[key].header_title}:{' '}
                    </span>
                    <span className="sui-termDefDetails__text">
                        {details[key].header_text.join(', ')}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default TermDefinitionsDetails;
