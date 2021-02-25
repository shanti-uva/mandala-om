import React, { useEffect, useRef, useState } from 'react';
import Badge from 'react-bootstrap/Badge';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/cjs/Nav';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import Spinner from 'react-bootstrap/Spinner';
import { FacetChoice } from './FacetChoice';
import HistoryViewer from '../views/History/HistoryViewer';
import { BsArrowCounterclockwise } from 'react-icons/bs';
import * as PropTypes from 'prop-types';
import _ from 'lodash';
import { Type } from '../model/HistoryModel';

function countSearchItems(historyStack) {
    return historyStack.filter((x) => {
        return x.search?.length > 0;
    }).length;
}

export function HistoryBox(props) {
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

    // if the sortField or sortDirection change make sure the send handleNarrowFilter messages
    // useEffect(() => {
    //     handleNarrowFilters();
    // }, [sortField, sortDirection]);

    // useEffect(() => {
    //     inputEl.current.value = '';
    // }, [props.resetFlag]);

    // console.log("HistoryBox: props = ", props);

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
    // console.log("HistoryBox (" + facetType + ") chosenHash: ", chosenHash );

    const ICON_MAP = {
        'audio-video': <span className={'icon u-icon__audio-video'} />,
        texts: <span className={'u-icon__texts icon'} />,
        'texts:pages': <span className={'u-icon__texts icon'} />,
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
        feature_types: <span className={'u-icon__explore icon'} />,
    };

    chosen_icon = chosen_icon || ICON_MAP[facetType];
    const icon = chosen_icon;
    const plus = <span className={'u-icon__plus icon'} />;
    const minus = <span className={'u-icon__minus icon'} />;
    const label = props.label || 'UNKNOWN LABEL';

    // console.debug("HistoryBox: props = ", props);

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
            // console.log("HistoryBox.parseEntry: " + JSON.stringify(entry));
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

    const historyLength = 1; // TODO: Dummy data. Need to fix.

    const historyList = <HistoryViewer mode={'search'} />;

    const name = 'sort_' + props.id;
    const handleResetHistory = () => {
        console.log('HistoryBox:  RESET HISTORY');
    };
    const historyBox = (
        <div className={'sui-advBox sui-advBox-' + props.id}>
            <div
                className={'sui-advHeader'}
                id={'sui-advHeader-A'}
                onClick={() => setOpen(!open)}
            >
                <span className={'icon'}>
                    <BsArrowCounterclockwise />
                </span>
                <span className="app-name">{label}</span>
                <span id={'sui-advPlus-' + props.id} className={'sui-advPlus'}>
                    <Badge
                        pill
                        variant={historyLength ? 'primary' : 'secondary'}
                    >
                        {historyLength}
                    </Badge>{' '}
                    {open ? minus : plus}
                </span>
            </div>

            {/*<div className={'sui-advTerm'} id={'sui-advTerm-' + props.id}>*/}
            {/*    {chosenList}*/}
            {/*</div>*/}
            <div
                className={
                    'sui-advEdit c-FacetBox--expander ' +
                    (open ? 'open' : 'closed')
                }
                id={'sui-advEdit-' + props.id}
            >
                <Navbar>
                    <Nav.Item className={'sui-advEdit-facet-ctrls'}>
                        <input
                            type={'text'}
                            placeholder="Filter this list"
                            onChange={handleChange}
                            defaultValue={''}
                            onKeyDownCapture={handleKey}
                            ref={inputEl}
                        />
                    </Nav.Item>
                    <Navbar.Collapse className="justify-content-end">
                        <Nav.Link
                            eventKey="resetHistory"
                            onClick={handleResetHistory}
                        >
                            clear
                        </Nav.Link>
                    </Navbar.Collapse>
                </Navbar>

                <div className={'sui-adv-facetlist overflow-auto'}>
                    {historyLength ? historyList : 'Search History is empty.'}
                </div>
            </div>
        </div>
    );
    return historyBox;
}

HistoryBox.propTypes = {
    label: PropTypes.string,
    chosenIcon: PropTypes.string,
    facetType: PropTypes.string,
    filters: PropTypes.array,
};
