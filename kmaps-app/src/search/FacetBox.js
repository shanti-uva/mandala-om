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
            <span className={props.className}></span> {props.label}(
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
    const facetType = props.facetType;
    const filters = props.filters;
    console.log('FacetBox Filters: ', filters);

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
        creator: '\ue600',
        languages: '\ue670',
    };

    chosen_icon = chosen_icon || ICON_MAP[facetType];
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
        return { label: label, fullLabel: fullLabel, value: uid ? uid : label };
    }

    const facetList = _.map(props.facets?.buckets, (entry) => {
        // Adjust
        const iconClass = 'shanticon-' + entry.val + ' icon';
        const { label, fullLabel, value } = parseEntry(entry, false);
        const count = entry.count;
        return (
            <FacetChoice
                key={`${value} ${label} ${facetType}`}
                className={iconClass}
                value={value}
                label={fullLabel}
                count={count}
                facetType={facetType}
            />
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
                <span id={'sui-advPlus-' + props.id} className={'sui-advPlus'}>
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
                <input placeholder="Filter this list" value="" />
                <div className={'sui-adv-facetlist overflow-auto'}>
                    {facetList}
                </div>
            </div>
        </div>
    );
    return facetBox;
}

FacetBox.propTypes = {
    label: PropTypes.string,
    chosenIcon: PropTypes.string,
    facetType: PropTypes.string,
    filters: PropTypes.array,
};
