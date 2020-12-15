import React from 'react';
import _ from 'lodash';
import './TermDefinitionsDetails.css';

const TermDefinitionsDetails = ({ details }) => {
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
