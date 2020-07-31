import * as PropTypes from 'prop-types';
import React from 'react';

export function FacetChoice(props) {
    function handleFacetAdd() {
        // console.log("DELEGATING Add Click: ", props);
        props.onFacetClick({ ...props, action: 'add' });
    }

    function handleFacetRemove(x, y) {
        // console.log("DELEGATING Remove Click: ", props)
        props.onFacetClick({ ...props, action: 'remove' });
    }

    const chosen = props.chosen ? 'chosen' : '';

    const choice =
        props.mode === 'add' ? (
            <div
                onClick={handleFacetAdd}
                className={'sui-advEditLine ' + chosen}
            >
                <span className={props.className}></span> {props.label}(
                {props.count}){' '}
            </div>
        ) : (
            <div>
                <span
                    onClick={handleFacetRemove}
                    className={props.className}
                ></span>{' '}
                {props.label}
            </div>
        );
    return choice;
}

FacetChoice.propTypes = {
    className: PropTypes.string,
    value: PropTypes.any,
    count: PropTypes.any,
    mode: PropTypes.string,
    chosen: PropTypes.bool,
    onFacetClick: PropTypes.func,
};
