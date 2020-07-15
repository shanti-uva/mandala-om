import React from 'react';
import _ from 'lodash';
import ReactHtmlParser from 'react-html-parser';
import './TermEtymology.css';

const TermEtymology = (props) => {
    let etymologies = _.pickBy(props.kmap, (value, key) =>
        /^etymology_\d+/.test(key)
    );
    etymologies = _.reduce(
        etymologies,
        (accum, val, key) => {
            const num = /^etymology_(\d+)/.exec(key)[1];
            if (!accum[num]) accum[num] = {};
            if (key.indexOf('_content_') !== -1) {
                accum[num]['content'] = val;
            } else {
                accum[num]['heading'] = val;
            }
            return accum;
        },
        {}
    );

    return (
        <div className="sui-etymology__wrapper">
            <div className="sui-etymology__content">
                {Object.keys(etymologies).map((key) => (
                    <div key={key} className="sui-etymology__content-items">
                        <span className="sui-etymology__heading">
                            {etymologies[key].heading}:{' '}
                        </span>
                        <span className="sui-etymology__text">
                            {ReactHtmlParser(
                                etymologies[key].content
                                    .toString()
                                    .replace(/(<([^>]+)>)/gi, '')
                            )}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TermEtymology;
