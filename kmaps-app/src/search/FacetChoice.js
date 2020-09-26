import * as PropTypes from 'prop-types';
import React from 'react';
import { selectIcon } from '../views/common/utils';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

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
    const icon = selectIcon(props.facetType);

    const choice =
        props.mode === 'add' ? (
            <div
                onClick={handleFacetAdd}
                className={'sui-advEditLine ' + chosen}
            >
                <span className={props.className}></span> {icon} {props.label}(
                {props.count}){' '}
            </div>
        ) : (
            <div>
                <span
                    onClick={handleFacetRemove}
                    className={props.className}
                ></span>{' '}
                {icon} {props.label}
            </div>
        );

    const renderTooltip = (p) => {
        // console.log("renderToolTip: p = ", p);
        // console.log("renderToolTip: props = ", props);

        return (
            <Popover {...p} className={'c-FacetChoice--popover'}>
                <Popover.Content>{props.value}</Popover.Content>
            </Popover>
        );
    };

    const wrapped_choice = (
        <OverlayTrigger
            placement="auto"
            delay={{ show: 250, hide: 400 }}
            overlay={renderTooltip}
            data-filters={props.location?.state?.filters}
            popperConfig={{
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 10],
                        },
                    },
                ],
            }}
        >
            {choice}
        </OverlayTrigger>
    );

    return wrapped_choice;
}

FacetChoice.propTypes = {
    className: PropTypes.string,
    value: PropTypes.any,
    count: PropTypes.any,
    mode: PropTypes.string,
    chosen: PropTypes.bool,
    onFacetClick: PropTypes.func,
};
