import { FacetBox } from './FacetBox';
import React, { useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Link, useHistory, useRouteMatch } from 'react-router-dom';
import Badge from 'react-bootstrap/Badge';
import { HistoryBox } from './HistoryBox';
import { useSearch } from '../hooks/useSearch';

const SEARCH_PATH = '/search';

export default function SearchAdvanced(props) {
    const history = useHistory();
    let [reset, setReset] = useState(0);

    // This tells us whether we are viewing the search results
    // so that we can give a link to go there (or not).
    const searchView = useRouteMatch(SEARCH_PATH);

    // console.log("SearchAdvance searchView = ", searchView);
    let [booleanControls, setBooleanControls] = useState(true);
    const {
        isLoading: isSearchLoading,
        data: searchData,
        isError: isSearchError,
        error: searchError,
    } = useSearch('', 0, 0, 'all', 0, 0, true);

    let openclass = props.advanced ? 'open' : 'closed';
    //const historyStack = useStoreState((state) => state.history.historyStack);
    const historyStack = {};

    console.log('GerardKetuma|SearchData', searchData);

    if (isSearchLoading) {
        return (
            <aside
                id="l-column__search"
                className={`l-column__search ${openclass}`}
            >
                <span>Search Loading Skeleton</span>
            </aside>
        );
    }

    if (isSearchError) {
        return (
            <aside
                id="l-column__search"
                className={`l-column__search ${openclass}`}
            >
                <span>Error: {searchError.message}</span>
            </aside>
        );
    }

    const handleBooleanControlClick = () =>
        setBooleanControls(!booleanControls);

    function gotoSearchPage() {
        if (!searchView) {
            if (process.env.REACT_APP_STANDALONE === 'standalone') {
                window.location.href = `${process.env.REACT_APP_STANDALONE_PATH}/#/search`;
            } else {
                history.push(SEARCH_PATH);
            }
        }
    }

    function handleFacetChange(msg) {
        const command = {
            facetType: msg.facetType,
            value: msg.value,
            operator: msg.operator,
            action: msg.action,
        };
        // console.log("SearchAdvanced:  handleFacetChange:  received: ", command);
        const search = props.search;
        const compound_id = `${msg.facetType}:${msg.value}`;

        if (command.action === null || command.action === 'add') {
            const new_filter = {
                id: compound_id,
                label: msg.labelText,
                operator: msg.operator,
                field: msg.facetType,
                match: msg.value,
            };

            console.log(
                'NEW FILTER: ' + JSON.stringify(new_filter, undefined, 2)
            );
            search.addFilters([new_filter]);
        } else if (command.action === 'remove') {
            search.removeFilters([{ id: compound_id }]);
        }
        if (command.action !== 'remove') {
            gotoSearchPage(); // declaratively navigate to search
        }
    }

    function handleNarrowFilters(narrowFilter) {
        // console.log('handleNarrowFilters narrowFilter = ', narrowFilter);
        const search = props?.search;
        if (search) {
            search.narrowFilters(narrowFilter);
        }
    }

    function getChosenFacets(type) {
        // console.log("getChosenFacets: finding in:", props.search.query.filters)
        return props?.search?.query?.filters?.filter((x) => x.field === type);
    }

    function handleResetFilters() {
        if (props.search) {
            props.search.clearFilters();
        }
        setReset(reset + 1);
    }

    function handleResetAll() {
        if (props.search) {
            props.search.clearAll();
        }
        setReset(reset + 1);
    }

    function handleResetSuper() {
        if (props.search) {
            props.search.superClear();
        }
        setReset(reset + 1);
    }

    // console.log ("SEARCHY ", props );
    function closeAdvanced() {}

    // TODO: review whether the FacetBoxes should be a configured list rather than hand-managed components as they are now.
    return (
        <aside
            id="l-column__search"
            className={`l-column__search ${openclass}`}
        >
            <Navbar className={'justify-content-end'}>
                <Nav.Link onClick={closeAdvanced}>
                    <span className={'icon shanticon-cancel'}></span>
                </Nav.Link>
            </Navbar>
            <Navbar>
                {/*<Navbar.Brand href="#home">Navbar with text</Navbar.Brand>*/}
                <Navbar.Toggle />
                {!searchView &&
                    process.env.REACT_APP_STANDALONE !== 'standalone' && (
                        <Link to={SEARCH_PATH}>
                            {' '}
                            Show Results{' '}
                            <Badge pill variant={'secondary'}>
                                {searchData.response?.numFound}
                            </Badge>
                        </Link>
                    )}
                {!searchView &&
                    process.env.REACT_APP_STANDALONE === 'standalone' && (
                        <a
                            href={`${process.env.REACT_APP_STANDALONE_PATH}/#/search`}
                        >
                            {'<<'} Show Results{' '}
                            <Badge pill variant={'secondary'}>
                                {searchData.response?.numFound}
                            </Badge>
                        </a>
                    )}
                <Navbar.Collapse className="justify-content-end">
                    <Navbar.Text>Reset: </Navbar.Text>
                    <Nav.Link
                        eventKey="resetFilters"
                        onClick={handleResetFilters}
                    >
                        Filters
                    </Nav.Link>
                    |
                    <Nav.Link
                        eventKey="resetAll"
                        onMouseOver={(x) => console.log(x)}
                        onClick={handleResetAll}
                    >
                        All
                    </Nav.Link>
                </Navbar.Collapse>
            </Navbar>

            <section>
                <FacetBox
                    id="asset_count"
                    label="item type"
                    facets={searchData.facets?.asset_count?.numBuckets}
                    facetType={'asset_type'}
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('asset_type')}
                    booleanControls={booleanControls}
                />
                <FacetBox
                    id="related_subjects"
                    label="related subjects"
                    facets={searchData.facets?.related_subjects?.numBuckets}
                    facetType="subjects"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('subjects')}
                    booleanControls={booleanControls}
                />
                <FacetBox
                    id="related_places"
                    label="related places"
                    facets={searchData.facets?.related_places?.numBuckets}
                    facetType="places"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('places')}
                    booleanControls={booleanControls}
                />
                <FacetBox
                    id="related_terms"
                    label="related terms"
                    facets={searchData.facets?.related_terms?.numBuckets}
                    facetType="terms"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('terms')}
                    booleanControls={booleanControls}
                />
                <FacetBox
                    id="feature_types"
                    label="feature types"
                    facets={searchData.facets?.feature_types?.numBuckets}
                    facetType="feature_types"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('feature_types')}
                    booleanControls={booleanControls}
                />

                <FacetBox
                    id="collections"
                    label="collections"
                    facets={searchData.facets?.collections?.numBuckets}
                    facetType="collections"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('collections')}
                    booleanControls={booleanControls}
                />
                <FacetBox
                    id="languages"
                    label="languages"
                    facets={searchData.facets?.languages?.numBuckets}
                    facetType="languages"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('languages')}
                    booleanControls={booleanControls}
                />
                <FacetBox
                    id="node_user"
                    label="users"
                    facets={searchData.facets?.node_user?.numBuckets}
                    facetType="users"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('users')}
                    booleanControls={booleanControls}
                />

                <FacetBox
                    id="creator"
                    label="creator"
                    facets={searchData.facets?.creator?.numBuckets}
                    facetType="creator"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('creator')}
                    booleanControls={booleanControls}
                />

                <FacetBox
                    id="perspective"
                    label="perspective"
                    facets={searchData.facets?.perspective?.numBuckets}
                    facetType="perspective"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('perspective')}
                    booleanControls={booleanControls}
                />

                <FacetBox
                    id="associated_subjects"
                    label="Associated Subjects"
                    facets={searchData.facets?.associated_subjects?.numBuckets}
                    facetType="associated_subjects"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('associated_subjects')}
                    booleanControls={booleanControls}
                />

                <HistoryBox
                    historyStack={historyStack}
                    id="recent"
                    label="recent searches"
                    facetType="recent-searches"
                />
            </section>
            <div className={'sui-advFooter'}>
                Show Boolean Controls? &nbsp;
                <input
                    type="checkbox"
                    onChange={handleBooleanControlClick}
                    checked={booleanControls}
                    id="sui-showBool"
                ></input>
            </div>
        </aside>
    );
}
