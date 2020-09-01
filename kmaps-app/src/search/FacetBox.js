import React, { useEffect, useRef, useState } from 'react';
import Badge from 'react-bootstrap/Badge';
import _ from 'lodash';
import * as PropTypes from 'prop-types';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import { useStoreState } from 'easy-peasy';
import Spinner from 'react-bootstrap/Spinner';
import { FacetChoice } from './FacetChoice';

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
        collections: <span className={'icon u-icon__collections'} />,
        'recent-searches': '\ue62e',
        asset_type: <span className={'icon u-icon__texts'} />,
        users: <span className={'icon u-icon__agents'} />,
        creator: <span className={'icon u-icon__address-card-o'} />,
        languages: <span className={'icon u-icon__comments-o'} />,
        feature_types: <span className={'icon u-icon__explore'} />,
    };

    chosen_icon = chosen_icon || ICON_MAP[facetType];
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
        const removeIconClass = 'sui-advTermRem u-icon__cancel-circle icon';
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

    const name = 'sort_' + props.id;
    const facetBox = (
        <div className={'sui-advBox sui-advBox-' + props.id}>
            <div
                className={'sui-advHeader'}
                id={'sui-advHeader-A'}
                onClick={() => setOpen(!open)}
            >
                <span className={'icon'}>{icon}</span>
                <span>{label}</span>
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
                <div className={'sui-advEdit-facet-ctrls'}>
                    <input
                        type={'text'}
                        placeholder="Filter this list"
                        onChange={handleChange}
                        defaultValue={''}
                        onKeyDownCapture={handleKey}
                        ref={inputEl}
                    />

                    <span className={'sui-advEdit-facet-ctrls-btns'}>
                        <ToggleButtonGroup
                            onChange={setSortField}
                            name={name + '_field'}
                            type={'radio'}
                            value={sortField}
                            ref={sortFieldEl}
                        >
                            <ToggleButton
                                name={name + '_field'}
                                type={'radio'}
                                value={'count'}
                            >
                                #
                            </ToggleButton>
                            <ToggleButton
                                name={name + '_field'}
                                type={'radio'}
                                value={'index'}
                            >
                                A-Z
                            </ToggleButton>
                        </ToggleButtonGroup>
                        <span> </span>
                        <ToggleButtonGroup
                            onChange={setSortDirection}
                            name={name + '_direction'}
                            value={sortDirection}
                            ref={sortDirectionEl}
                        >
                            <ToggleButton
                                name={name + '_direction'}
                                type={'radio'}
                                value={'desc'}
                            >
                                <span
                                    className={'icon u-icon__arrow-tip-down'}
                                ></span>
                            </ToggleButton>
                            <ToggleButton
                                name={name + '_direction'}
                                type={'radio'}
                                value={'asc'}
                            >
                                <span
                                    className={'icon u-icon__arrow-tip-up'}
                                ></span>
                            </ToggleButton>
                        </ToggleButtonGroup>

                        {loadingState && (
                            <Spinner animation="border" role="status">
                                <span className="sr-only">Loading...</span>
                            </Spinner>
                        )}
                    </span>
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
