import React, { useState } from 'react';
import Badge from 'react-bootstrap/Badge';
import _ from 'lodash';
import * as PropTypes from 'prop-types';

function FacetChoice(props) {
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
};

export function FacetBox(props) {
    const [open, setOpen] = useState(false);
    let chosen_icon = props.icon;
    const facetType = props.facetType;
    const filters = props.filters;
    const chosenFacets = props.chosenFacets || [];
    // console.log('FacetBox (' + facetType + ') filters: ', filters);
    // console.log('FacetBox (' + facetType + ') chosenFacets: ', chosenFacets);

    function arrayToHash(array, keyField) {
        return array.reduce((collector, item) => {
            collector[item[keyField]] = item;
            return collector;
        }, {});
    }
    const chosenHash = arrayToHash(chosenFacets, 'id');

    // console.log("chosen hash = ", chosenHash);
    const isChosen = (id) => (chosenHash[id] ? true : false);
    // console.log("FacetBox (" + facetType + ") chosenHash: ", chosenHash );

    const ICON_MAP = {
        'audio-video': <span className={'icon shanticon-audio-video'} />,
        texts: <span className={'shanticon-texts icon'} />,
        'texts:pages': <span className={'shanticon-texts icon'} />,
        images: '\ue62a',
        sources: '\ue631',
        visuals: '\ue63b',
        places: '\ue62b',
        subjects: '\ue634',
        terms: '\ue635',
        collections: '\ue633',
        'recent-searches': '\ue62e',
        asset_type: '\ue60b',
        users: '\ue600',
        creator: '\ue600',
        languages: '\ue670',
        feature_types: <span className={'shanticon-uniE626 icon'} />,
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
                {label} {extra}
            </span>
        );
        return { label: label, fullLabel: fullLabel, value: uid ? uid : label };
    }

    function chooseIconClass(entry) {
        let icoclass = entry.val;
        icoclass = icoclass === 'texts:pages' ? 'file-text-o' : icoclass;
        return 'shanticon-' + icoclass + ' icon';
    }

    function parseId(id) {
        const split = id.split('|');
        const uid = split[1] ? split[1] : id;
        return uid;
    }

    const facetList = _.map(props.facets?.buckets, (entry) => {
        // Adjust
        const iconClass = chooseIconClass(entry);
        const { label, fullLabel, value } = parseEntry(entry, false);
        const count = entry.count;
        const id = facetType + ':' + parseId(entry.val);
        return (
            <FacetChoice
                mode={'add'}
                key={`${value} ${label} ${facetType}`}
                className={iconClass}
                value={value}
                labelText={label}
                label={fullLabel}
                count={count}
                facetType={facetType}
                chosen={isChosen(id)}
                onFacetClick={(msg) => {
                    props.onFacetClick({
                        ...msg,
                        action: isChosen(id) ? 'remove' : 'add',
                    });
                }}
            />
        );
    });
    const chosenList = _.map(props.chosenFacets, (entry) => {
        const removeIconClass = 'sui-advTermRem shanticon-cancel-circle icon';
        // console.log("Creating removal FacetChoice from ", entry);

        return (
            <FacetChoice
                mode={'remove'}
                key={`Remove ${entry.match} ${label} ${facetType}`}
                className={removeIconClass}
                value={entry.match}
                labelText={entry.label}
                label={entry.label}
                facetType={facetType}
                onFacetClick={(msg) => {
                    props.onFacetClick({ ...msg, action: 'remove' });
                }}
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

            <div className={'sui-advTerm'} id={'sui-advTerm-' + props.id}>
                {chosenList}
            </div>
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
