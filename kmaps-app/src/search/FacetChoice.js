import * as PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
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

    function handleSetOperator(operator, display) {
        props.onOperatorClick({ ...props, operator: operator, action: 'add', mode: 'add' });
        setExpanded(<div className="sui-advEditBool" onClick={() => setExpanded(operatorOptions)}>{operator+"\u00a0"}</div>);
    }

    const chosen = props.chosen ? 'chosen' : '';
    const icon = selectIcon(props.facetType);

    const operator = props.operator;
    const operatorDisplay = <div className="sui-advEditBool" onClick={() => setExpanded(operatorOptions)}>{operator+"\u00a0"}</div>;
    const operatorOptions = <div className="sui-advEditBool" title="Change boolean method">
                  <div className="sui-boolItem" onClick={() => handleSetOperator('AND', operatorDisplay)} id="sui-boolItem-places-0-AND">AND</div>|
                  <div className="sui-boolItem" onClick={() => handleSetOperator('OR', operatorDisplay)}  id="sui-boolItem-places-0-OR">OR</div>|
                  <div className="sui-boolItem" onClick={() => handleSetOperator('NOT', operatorDisplay)} id="sui-boolItem-places-0-NOT">NOT</div>&nbsp;
                </div>;
    const [expanded, setExpanded] = useState(operatorDisplay);

    
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
                {props.booleanControls && expanded}
                {' '}
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
