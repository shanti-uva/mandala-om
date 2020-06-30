import { FacetBox } from './FacetBox';
import React from 'react';

export function SearchAdvanced(props) {
    const query = '';
    const openclass = props.advanced ? 'open' : 'closed';

    console.debug('SearchAdvanced: query = ', props.search.query);
    console.debug('SearchAdvanced: facets = ', props.facets);

    const advanced = (
        <div id="sui-adv" className={`sui-adv ${openclass} overflow-auto`}>
            <div className={'overflow-auto'}>
                <FacetBox
                    id="squawk"
                    label="item type"
                    facets={props.facets.asset_count}
                    facetType={'assets'}
                />
                <FacetBox
                    id="squawk"
                    label="related subjects"
                    facets={props.facets.related_subjects}
                    facetType="subjects"
                />
                <FacetBox
                    id="squawk"
                    label="related places"
                    facets={props.facets.related_places}
                    facetType="places"
                />
                <FacetBox
                    id="squawk"
                    label="related terms"
                    facets={props.facets.related_terms}
                    facetType="terms"
                />
                <FacetBox
                    id="squawk"
                    label="collections"
                    facets={props.facets.collections}
                    facetType="collections"
                />
                <FacetBox
                    id="squawk"
                    label="languages"
                    facets={props.facets.languages}
                    facetType="languages"
                />
                <FacetBox
                    id="squawk"
                    label="users"
                    facets={props.facets.node_user}
                    facetType="users"
                />

                <FacetBox
                    id="squawk"
                    label="creator"
                    facets={props.facets.creator}
                    facetType="creator"
                />

                <FacetBox
                    id="squawk"
                    label="recent searches"
                    facetType="recent-searches"
                />
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
