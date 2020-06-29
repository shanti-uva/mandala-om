import React, { useState } from 'react';
import Badge from 'react-bootstrap/Badge';
import _ from 'lodash';
import * as PropTypes from 'prop-types';

function FacetChoice(props) {
    const choice = (
        <div
            onClick={() => {
                console.log('click: ', props);
            }}
            className="sui-advEditLine"
            id="sui-advEditLine-0"
        >
            <span className={props.className}></span> {props.value} (
            {props.count}){' '}
        </div>
    );
    return choice;
}

FacetChoice.propTypes = {
    className: PropTypes.string,
    value: PropTypes.any,
    count: PropTypes.any,
};

export function FacetBox(props) {
    const [open, setOpen] = useState(false);
    let chosen_icon = props.icon;
    const assetType = props.assetType;
    const filters = props.filters;
    // console.log("FacetBox Filters: ", filters);

    const ICON_MAP = {
        'audio-video': <span className={'icon shanticon-audio-video'} />,
        texts: <span className={'shanticon-texts icon'} />,
        images: '\ue62a',
        sources: '\ue631',
        visuals: '\ue63b',
        places: '\ue62b',
        subjects: '\ue634',
        terms: '\ue635',
        collections: '\ue633',
        'recent-searches': '\ue62e',
        assets: '\ue60b',
        users: '\ue600',
        languages: '\ue670',
    };

    chosen_icon = chosen_icon || ICON_MAP[assetType];
    const icon = chosen_icon;
    const plus = <span className={'shanticon-plus icon'} />;
    const minus = <span className={'shanticon-minus icon'} />;
    const label = props.label || 'UNKNOWN LABEL';

    // console.debug("FacetBox: props = ", props);

    function parseEntry(entry, fullEntry) {
        // console.log("FacetBox.parseEntry: " + JSON.stringify(entry));
        let [label, uid] = entry.val.split('|');
        label = label ? label : 'undefined';
        const extra = fullEntry && uid ? <span>({uid})</span> : '';
        const fullLabel = (
            <span uid={uid}>
                {_.startCase(_.lowerCase(label))} {extra}
            </span>
        );
        return fullLabel;
    }

    const facetList = _.map(props.facets?.buckets, (entry) => {
        // Adjust
        const iconClass = 'shanticon-' + entry.val + ' icon';
        const value = parseEntry(entry, false);
        const count = entry.count;
        return (
            <FacetChoice className={iconClass} value={value} count={count} />
        );
    });

    const facetBox = (
        <div className="sui-advBox" id={'sui-advBox-' + props.id}>
            <div
                className={'sui-advHeader'}
                id={'sui-advHeader-A'}
                onClick={() => setOpen(!open)}
            >
                <span className={'icon'}>{icon}</span>&nbsp;&nbsp;{label}
                {/* TODO: refactor setOpen to be css-based */}
                <span id={'sui-advPlus-' + props.id} style={{ float: 'right' }}>
                    <Badge
                        pill
                        variant={facetList.length ? 'primary' : 'secondary'}
                    >
                        {facetList.length}
                    </Badge>{' '}
                    {open ? minus : plus}
                </span>
            </div>

            <div className={'sui-advTerm'} id={'sui-advTerm-' + props.id}></div>
            <div
                className={'sui-advEdit ' + (open ? 'open' : 'closed')}
                id={'sui-advEdit-' + props.id}
            >
                {/* TODO: refactor style to css*/}
                <input
                    placeholder="Search this list"
                    value=""
                    style={{
                        width: '90px',
                        border: '1px solid #999',
                        borderRadius: '12px',
                        fontSize: '11px',
                        paddingLeft: '6px',
                    }}
                />
                <div className={'sui-adv-facetlist overflow-auto'}>
                    {facetList}
                </div>
            </div>
        </div>
    );
    return facetBox;
}
