import { FacetBox } from './FacetBox';
import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import { Link, useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import Badge from 'react-bootstrap/Badge';

const SEARCH_PATH = '/search';

export function SearchAdvanced(props) {
    const history = useHistory();
    const query = '';
    const openclass = props.advanced ? 'open' : 'closed';
    let [reset, setReset] = useState(0);

    // This tells us whether we are viewing the search results
    // so that we can give a link to go there (or not).
    const searchView = useRouteMatch(SEARCH_PATH);
    // console.log("SearchAdvance searchView = ", searchView);

    function gotoSearchPage() {
        if (!searchView) history.push(SEARCH_PATH);
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

        gotoSearchPage();
    }

    function handleNarrowFilters(narrowFilter) {
        // console.log('handleNarrowFilters narrowFilter = ', narrowFilter);
        const search = props.search;
        search.narrowFilters(narrowFilter);
    }

    function getChosenFacets(type) {
        // console.log("getChosenFacets: finding in:", props.search.query.filters)
        return props.search.query?.filters.filter((x) => x.field === type);
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
    // TODO: review whether the FacetBoxes should be a configured list rather than hand-managed components
    const advanced = (
        <div id="sui-adv" className={`sui-adv ${openclass} overflow-auto`}>
            <Navbar onKeyDown={(x) => console.log(x)}>
                {/*<Navbar.Brand href="#home">Navbar with text</Navbar.Brand>*/}
                <Navbar.Toggle />
                {!searchView && (
                    <Link to={SEARCH_PATH}>
                        {'<<'} Show Results{' '}
                        <Badge pill variant={'secondary'}>
                            {props.pager.numFound}
                        </Badge>
                    </Link>
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

            <div className={'overflow-auto'}>
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

                <FacetBox
                    id="recent"
                    label="recent searches"
                    facetType="recent-searches"
                />

                <pre>
                    {JSON.stringify(props.search.query?.filters, undefined, 2)}
                </pre>
            </div>
            <div className={'sui-advFooter'}>
                Show Boolean Controls? &nbsp;
                <input
                    type="checkbox"
                    id="sui-showBool"
                    defaultChecked={'checked'}
                ></input>
            </div>
        </div>
    );
    return advanced;
}
