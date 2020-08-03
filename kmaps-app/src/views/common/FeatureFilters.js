import React from 'react';
import { useStoreActions, useStoreState } from 'easy-peasy';
import { FacetChoice } from '../../search/FacetChoice';
import Badge from 'react-bootstrap/Badge';
import { CSSTransition, TransitionGroup } from 'react-transition-group'; // ES6

export function FeatureFilters(props) {
    const filters = useStoreState((state) => state.search.query.filters);
    const search = useStoreState((state) => state.search);

    const { removeFilters } = useStoreActions((actions) => actions.search);

    function handleFacetClick(...x) {
        console.log('Received ', x);
        console.log(' try to remove id = ', x.value);
        removeFilters([{ id: x[0].value }]);
    }

    // console.log('FeatureFilters filters = ', filters);

    const removeIconClass = 'sui-advTermRem shanticon-cancel-circle icon';

    const entries = filters.map((entry) => {
        // console.log('FeatureFilters x = ', entry);
        return (
            <CSSTransition key={entry.id} timeout={1000} classNames="item">
                {/*<Badge*/}
                {/*    key={entry.id}*/}
                {/*    pill*/}
                {/*    variant={'secondary'}*/}
                {/*    className={'m-2 p-2 pr-3'}*/}
                {/*>*/}
                <FacetChoice
                    mode={'remove'}
                    key={`Remove ${entry.id}`}
                    className={removeIconClass}
                    value={entry.id}
                    labelText={entry.label}
                    label={entry.label}
                    facetType={entry.field}
                    onFacetClick={(msg) => {
                        handleFacetClick({ ...msg, action: 'remove' });
                    }}
                />
                {/*</Badge>*/}
            </CSSTransition>
        );
    });

    if (entries.length) {
        entries.unshift(
            <CSSTransition key="label" timeout={1000} classNames="item">
                <span>Applied Filters: </span>
            </CSSTransition>
        );
    }

    return (
        <span>
            <TransitionGroup className={'sui-facetList-horiz'}>
                {entries}
            </TransitionGroup>
        </span>
    );
}
