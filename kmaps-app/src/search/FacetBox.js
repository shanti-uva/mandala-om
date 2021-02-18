import React, { useEffect, useRef, useState } from 'react';
import Badge from 'react-bootstrap/Badge';
import _ from 'lodash';
import * as PropTypes from 'prop-types';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import { useStoreState } from 'easy-peasy';
import Spinner from 'react-bootstrap/Spinner';
import { FacetChoice } from './FacetChoice';

import { BsCheckCircle, BsMap } from 'react-icons/bs';
import { ImStack } from 'react-icons/im';

import './FacetBox.scss';

function FacetControls(props) {
    return (
        <span className={'sui-advEdit-facet-ctrls-btns'}>
            <ToggleButtonGroup
                onChange={props.onChange}
                name={props.name + '_field'}
                type={'radio'}
                value={props.value}
                ref={props.ref}
            >
                <ToggleButton
                    name={props.name + '_field'}
                    type={'radio'}
                    value={'count'}
                    onClick={props.onClick}
                >
                    #
                </ToggleButton>
                <ToggleButton
                    name={props.name + '_field'}
                    type={'radio'}
                    value={'index'}
                    onClick={props.onClick}
                >
                    A-Z
                </ToggleButton>
            </ToggleButtonGroup>

            {props.loadingState && (
                <Spinner animation="border" role="status">
                    <span className="sr-only">Loading...</span>
                </Spinner>
            )}
        </span>
    );
}

FacetControls.propTypes = {
    onChange: PropTypes.func,
    name: PropTypes.string,
    value: PropTypes.string,
    ref: PropTypes.any,
    onClick: PropTypes.func,
    loadingState: PropTypes.bool,
};

export function FacetBox(props) {
    const inputEl = useRef(null);
    const sortFieldEl = useRef(null);
    const [sortField, setSortField] = useState('count');
    const sortDirectionEl = useRef(null);
    const [sortDirection, setSortDirection] = useState('desc');

    const [open, setOpen] = useState(false);

    let chosen_icon = props.icon;
    const facetType = props.facetType;
    const facets = props.facets;
    const chosenFacets = props.chosenFacets || [];

    const loadingState = useStoreState((state) => state.search.loadingState);

    // if the sortField or sortDirection change make sure the send handleNarrowFilter messages
    useEffect(() => {
        handleNarrowFilters();
    }, [sortField, sortDirection]);

    useEffect(() => {
        inputEl.current.value = '';
    }, [props.resetFlag]);

    // console.log("FacetBox: props = ", props);

    function arrayToHash(array, keyField) {
        return array.reduce((collector, item) => {
            collector[item[keyField]] = item;
            return collector;
        }, {});
    }

    const chosenHash = arrayToHash(chosenFacets, 'id');

    function handleNarrowFilters() {
        if (props.onNarrowFilters) {
            props.onNarrowFilters({
                filter: props.facetType,
                search: inputEl.current.value,
                sort: sortField + ' ' + sortDirection,
                limit: inputEl.current?.value?.length ? -1 : null,
            });
        }
    }

    const handleKey = (x) => {
        // submit on return
        if (x.keyCode === 13) {
            handleNarrowFilters();
        }
    };

    const handleChange =
        // To be used for completions if desired
        _.debounce(() => {
            console.log('handleChange: ', inputEl.current.value);
            handleNarrowFilters();
        }, 500);

    // console.log("chosen hash = ", chosenHash);
    const isChosen = (id) => (chosenHash[id] ? true : false);
    // console.log("FacetBox (" + facetType + ") chosenHash: ", chosenHash );

    const ICON_MAP = {
        'audio-video': <span className={'icon u-icon__audio-video'} />,
        texts: <span className={'icon u-icon__texts'} />,
        'texts:pages': <span className={'icon u-icon__texts'} />,
        images: <span className={'icon u-icon__images'} />,
        sources: <span className={'icon u-icon__sources'} />,
        visuals: <span className={'icon u-icon__visuals'} />,
        places: <span className={'icon u-icon__places'} />,
        subjects: <span className={'icon u-icon__subjects'} />,
        terms: <span className={'icon u-icon__terms'} />,
        collections: <ImStack />,
        //       'recent-searches': '\ue62e',
        asset_type: <BsCheckCircle />,
        users: <span className={'icon u-icon__community'} />,
        creator: <span className={'icon u-icon__agents'} />,
        languages: <span className={'icon u-icon__comments-o'} />,
        feature_types: <BsMap />,
        associated_subjects: <span className={'icon u-icon__essays'} />,
        perspective: <span className={'icon u-icon__file-picture'} />,
    };

    chosen_icon = chosen_icon || ICON_MAP[facetType];
    // console.log('facetType = ', facetType, ' chosen_icon = ', chosen_icon);

    const icon = chosen_icon;
    const plus = <span className={'u-icon__plus icon'} />;
    const minus = <span className={'u-icon__minus icon'} />;
    const label = props.label || 'UNKNOWN LABEL';

    // console.debug("FacetBox: props = ", props);

    function parseEntry(entry, fullEntry) {
        let label = '';
        let uid = '';
        let fullLabel = '';

        if (entry.val.match(/[^=]+\=[^\|]+\|[^=]+.*/)) {
            // console.log("parseEntry SPECIAL CASE!")
            const [ref, val] = entry.val.split('|');
            const [refLabel, refUid] = ref.split('=');
            const [valLabel, valUid] = val.split('=');

            label = refLabel + ': ' + valLabel;
            uid = entry.val;
            fullLabel = label;
        } else {
            // console.log("FacetBox.parseEntry: " + JSON.stringify(entry));
            [label, uid] = entry.val.split('|');
            label = label ? label : 'undefined';
            const extra = fullEntry && uid ? <span>({uid})</span> : '';
            fullLabel = (
                <span uid={uid}>
                    {label} {extra}
                </span>
            );
        }
        return { label: label, fullLabel: fullLabel, value: uid ? uid : label };
    }

    function chooseIconClass(entry) {
        let icoclass = entry.val;
        icoclass = icoclass === 'texts:pages' ? 'file-text-o' : icoclass;
        return 'u-icon__' + icoclass + ' icon';
    }

    function parseId(id) {
        const split = id.split('|');
        const uid = split[1] ? split[1] : id;
        return uid;
    }

    const facetList = _.map(facets?.buckets, (entry) => {
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
                operator={'AND'}
                onFacetClick={(msg) => {
                    props.onFacetClick({
                        ...msg,
                        action: isChosen(id) ? 'remove' : 'add',
                    });
                }}
                booleanControls={props.booleanControls}
            />
        );
    });
    const chosenList = _.map(props.chosenFacets, (entry) => {
        const removeIconClass = 'sui-advTermRem u-icon__cancel-circle icon';
        // console.log("Creating removal FacetChoice from ", entry);

        return (
            <FacetChoice
                mode={'remove'}
                operator={'AND'}
                key={`Remove ${entry.match} ${label} ${facetType}`}
                className={removeIconClass}
                value={entry.match}
                labelText={entry.label}
                label={entry.label}
                facetType={facetType}
                onFacetClick={(msg) => {
                    props.onFacetClick({ ...msg, action: 'remove' });
                }}
                onOperatorClick={props.onFacetClick}
                booleanControls={props.booleanControls}
            />
        );
    });

    const name = 'sort_' + props.id;

    const handleSortClick = function (e) {
        if (e.target.name) {
            // console.log("ToggleButton CLICK name=", e.target.name, " value=", e.target.value);
            // console.log("ToggleButton CLICK current sortDirection= ", sortDirection);
            // console.log("ToggleButton CLICK current sortField= ", sortField);

            // We're clicking on the currently selected sort type -- Let's toggle the sort direction
            if (e.target.value === sortField) {
                if (sortDirection === 'asc') {
                    setSortDirection('desc');
                } else {
                    setSortDirection('asc');
                }
            }
        }
    };
    const maxFacetResult = 500;

    const facetBox = (
        <div className={'sui-advBox sui-advBox-' + props.id}>
            <div
                className={'sui-advHeader'}
                id={'sui-advHeader-A'}
                onClick={() => setOpen(!open)}
            >
                <span className={'icon'}>{icon}</span>
                <span className="app-name">{label}</span>
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
                className={
                    'sui-advEdit c-FacetBox--expander ' +
                    (open ? 'open' : 'closed')
                }
                id={'sui-advEdit-' + props.id}
            >
                <div className="sui-advTerm sui-advTerm__results-length-message">
                    <span>
                        {facetList.length >= maxFacetResult
                            ? `The results are limited to ${maxFacetResult} records, add more filters to narrow your search.`
                            : ''}
                    </span>
                </div>
                <div className={'sui-advEdit-facet-ctrls'}>
                    <input
                        type={'text'}
                        placeholder="Filter this list"
                        onChange={handleChange}
                        defaultValue={''}
                        onKeyDownCapture={handleKey}
                        ref={inputEl}
                    />

                    <FacetControls
                        onChange={setSortField}
                        name={name}
                        value={sortField}
                        onClick={handleSortClick}
                        loadingState={loadingState}
                    />
                </div>

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
