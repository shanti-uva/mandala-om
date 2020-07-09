import { FacetBox } from './FacetBox';
import React from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';

export function SearchAdvanced(props) {
    const query = '';
    const openclass = props.advanced ? 'open' : 'closed';

    // console.debug('SearchAdvanced: query = ', props.search.query);
    // console.debug('SearchAdvanced: facets = ', props.facets);

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
            console.log('ADD ' + compound_id);
            console.log('command = ', command);
            console.log('filters = ', search.query.filters);
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
            // console.log("REMOVE " + compound_id);
            // console.log("command = ", command);
            // console.log("filters = ", search.query.filters);
            search.removeFilters([{ id: compound_id }]);
        }
    }

    function handleNarrowFilters(narrowFilter) {
        console.log('handleNarrowFilters narrowFilter = ', narrowFilter);
        const search = props.search;
        search.narrowFilters(narrowFilter);
    }

    function getChosenFacets(type) {
        // console.log("getChosenFacets: finding in:", props.search.query.filters)
        return props.search.query?.filters.filter((x) => x.field === type);
    }

    function handleResetAll() {
        if (props.search) {
            props.search.clearFilters();
        }
    }

    const advanced = (
        <div id="sui-adv" className={`sui-adv ${openclass} overflow-auto`}>
            <Navbar>
                {/*<Navbar.Brand href="#home">Navbar with text</Navbar.Brand>*/}
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
                    <Navbar.Text onClick={handleResetAll}>
                        Reset All
                    </Navbar.Text>
                </Navbar.Collapse>
            </Navbar>

            {/*<div className={'sui-advBox'}>*/}
            {/*    <div className={'sui-adv-ctrls wd-100'}>*/}
            {/*        <ButtonGroup>*/}
            {/*        <Button>Eject</Button>*/}
            {/*        <Button className={'float-right'} type={'button'}>clear all</Button>*/}
            {/*        </ButtonGroup>*/}
            {/*    </div>*/}
            {/*</div>*/}
            <div className={'overflow-auto'}>
                <FacetBox
                    id="squawk"
                    label="item type"
                    facets={props.facets?.asset_count}
                    facetType={'asset_type'}
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('asset_type')}
                />
                <FacetBox
                    id="squawk"
                    label="related subjects"
                    facets={props.facets?.related_subjects}
                    facetType="subjects"
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('subjects')}
                />
                <FacetBox
                    id="squawk"
                    label="related places"
                    facets={props.facets?.related_places}
                    facetType="places"
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('places')}
                />
                <FacetBox
                    id="squawk"
                    label="related terms"
                    facets={props.facets?.related_terms}
                    facetType="terms"
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('terms')}
                />
                <FacetBox
                    id="squawk"
                    label="feature types"
                    facets={props.facets?.feature_types}
                    facetType="feature_types"
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('feature_types')}
                />

                <FacetBox
                    id="squawk"
                    label="collections"
                    facets={props.facets?.collections}
                    facetType="collections"
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('collections')}
                />
                <FacetBox
                    id="squawk"
                    label="languages"
                    facets={props.facets?.languages}
                    facetType="languages"
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('languages')}
                />
                <FacetBox
                    id="squawk"
                    label="users"
                    facets={props.facets?.node_user}
                    facetType="users"
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('users')}
                />

                <FacetBox
                    id="squawk"
                    label="creator"
                    facets={props.facets?.creator}
                    facetType="creator"
                    onFacetClick={handleFacetChange}
                    onNarrowFilters={handleNarrowFilters}
                    chosenFacets={getChosenFacets('creator')}
                />

                <FacetBox
                    id="squawk"
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
