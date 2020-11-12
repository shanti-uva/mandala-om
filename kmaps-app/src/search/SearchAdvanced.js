import { FacetBox } from './FacetBox';
import React, { useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Link, useHistory, useRouteMatch } from 'react-router-dom';
import Badge from 'react-bootstrap/Badge';
import { HistoryBox } from './HistoryBox';
import { useStoreState } from 'easy-peasy';

const SEARCH_PATH = '/search';

export function SearchAdvanced(props) {
    const history = useHistory();
    let openclass = props.advanced ? 'open' : 'closed';
    let [reset, setReset] = useState(0);
    const historyStack = useStoreState((state) => state.history.historyStack);

    // This tells us whether we are viewing the search results
    // so that we can give a link to go there (or not).
    const searchView = useRouteMatch(SEARCH_PATH);

    // console.log("SearchAdvance searchView = ", searchView);

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
    function closeAdvanced() {
        if (typeof props.onStateChange === 'function') {
            props.onStateChange({ advanced: false });
        } else {
            console.error(
                'SearchAdvanced: No onStateChange() function passed in properties!'
            );
        }
    }

    // TODO: review whether the FacetBoxes should be a configured list rather than hand-managed components as they are now.
    const advanced = (
        <aside
            id="l-column__search"
            className={`l-column__search ${openclass} overflow-auto`}
        >
            {typeof props.onStateChange === 'function' && (
                <Navbar className={'justify-content-end'}>
                    <Nav.Link onClick={closeAdvanced}>
                        <span className={'icon shanticon-cancel'}></span>
                    </Nav.Link>
                </Navbar>
            )}
            <Navbar>
                {/*<Navbar.Brand href="#home">Navbar with text</Navbar.Brand>*/}
                <Navbar.Toggle />
                {!searchView &&
                    process.env.REACT_APP_STANDALONE !== 'standalone' && (
                        <Link to={SEARCH_PATH}>
                            {'<<'} Show Results{' '}
                            <Badge pill variant={'secondary'}>
                                {props?.pager?.numFound}
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
                                {props?.pager?.numFound}
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
                    id="asset_type"
                    label="item type"
                    facets={props.facets?.asset_count}
                    facetType={'asset_type'}
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('asset_type')}
                />
                <FacetBox
                    id="subjects"
                    label="related subjects"
                    facets={props.facets?.related_subjects}
                    facetType="subjects"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('subjects')}
                />
                <FacetBox
                    id="places"
                    label="related places"
                    facets={props.facets?.related_places}
                    facetType="places"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('places')}
                />
                <FacetBox
                    id="terms"
                    label="related terms"
                    facets={props.facets?.related_terms}
                    facetType="terms"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('terms')}
                />
                <FacetBox
                    id="feature_types"
                    label="feature types"
                    facets={props.facets?.feature_types}
                    facetType="feature_types"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('feature_types')}
                />

                <FacetBox
                    id="collections"
                    label="collections"
                    facets={props.facets?.collections}
                    facetType="collections"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('collections')}
                />
                <FacetBox
                    id="languages"
                    label="languages"
                    facets={props.facets?.languages}
                    facetType="languages"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('languages')}
                />
                <FacetBox
                    id="users"
                    label="users"
                    facets={props.facets?.node_user}
                    facetType="users"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('users')}
                />

                <FacetBox
                    id="creator"
                    label="creator"
                    facets={props.facets?.creator}
                    facetType="creator"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('creator')}
                />

                <FacetBox
                    id="perspective"
                    label="perspective"
                    facets={props.facets?.perspective}
                    facetType="perspective"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('perspective')}
                />

                <FacetBox
                    id="associated subjects"
                    label="Associated Subjects"
                    facets={props.facets?.associated_subjects}
                    facetType="associated_subjects"
                    resetFlag={reset}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('associated_subjects')}
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
                    id="sui-showBool"
                    defaultChecked={'checked'}
                ></input>
            </div>
        </aside>
    );

    return advanced;
}
