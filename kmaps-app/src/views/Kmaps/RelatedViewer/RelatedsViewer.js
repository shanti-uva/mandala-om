import React from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import FancyTree from '../../FancyTree';
import HistoryViewer from '../../History/HistoryViewer';
import { useKmapRelated } from '../../../hooks/useKmapRelated';
import { useUnPackedMemoized } from '../../../hooks/utils';
import './RelatedsViewer.scss';

export function RelatedsViewer(props) {
    const match = useRouteMatch([
        '/:baseType/:baseUid/related-:type',
        '/:baseType/:baseUid',
    ]);

    const loc = match?.params.type || 'home';
    let locMatch = {};
    locMatch[loc] = 'selected';

    let baseArgs = {
        baseType: match?.params.baseType,
        baseUid: match?.params.baseUid,
    };

    const {
        isLoading: isRelatedLoading,
        data: relatedData,
        isError: isRelatedError,
        error: relatedError,
    } = useKmapRelated(baseArgs.baseUid, 'all', 0, 100);

    //Unpack related data using memoized function
    const kmapsRelated = useUnPackedMemoized(
        relatedData,
        baseArgs.baseUid,
        'all',
        0,
        100
    );

    if (!baseArgs.baseUid || !baseArgs.baseType) {
        return null;
    }

    if (isRelatedLoading) {
        return (
            <aside className="l-column__related">
                <div className="l-column__related__wrap">
                    <section className="l-related__list__wrap">
                        <span>
                            Related Sidebar
                            <br />
                            Loading Skeleton
                        </span>
                    </section>
                </div>
            </aside>
        );
    }

    if (isRelatedError) {
        return (
            <aside className="l-column__related">
                <div className="l-column__related__wrap">
                    <section className="l-related__list__wrap">
                        <span>Error: {relatedError.message}</span>
                    </section>
                </div>
            </aside>
        );
    }

    //Set relateds data to baseArgs
    baseArgs.relateds = kmapsRelated;

    // Determine which tree (browse_tree) to display in the relateds sidebar
    const current_domain = baseArgs.baseType;

    let browse_tree = null;

    if (current_domain === 'places') {
        browse_tree = (
            <FancyTree
                domain="places"
                tree="places"
                descendants={true}
                directAncestors={false}
                displayPopup={true}
                perspective="pol.admin.hier"
                view="roman.scholar"
                sortBy="header_ssort+ASC"
                currentFeatureId={props.id}
            />
        );
    }

    if (current_domain === 'subjects') {
        browse_tree = (
            <FancyTree
                domain="subjects"
                tree="subjects"
                descendants={true}
                directAncestors={false}
                displayPopup={true}
                perspective={'gen'}
                view="roman.popular"
                sortBy="header_ssort+ASC"
                currentFeatureId={props.id}
            />
        );
    }

    if (current_domain === 'terms') {
        browse_tree = (
            <FancyTree
                domain="terms"
                tree="terms"
                descendants={true}
                directAncestors={false}
                displayPopup={true}
                perspective="tib.alpha"
                view="roman.scholar"
                sortBy="position_i+ASC"
                currentFeatureId={props.id}
            />
        );
    }
    return (
        <aside className={'l-column__related'}>
            <div className="l-column__related__wrap">
                <section className="l-related__list__wrap">
                    <div className="u-related__list__header">
                        Related Resources
                    </div>
                    <div className="c-relatedViewer">
                        <Link
                            id="sui-rl-Home"
                            to={
                                '/' + baseArgs.baseType + '/' + baseArgs.baseUid
                            }
                            className={`c-related__link--home c-related__item ${locMatch['home']}`}
                        >
                            <span className={'icon u-icon__overview'}></span>{' '}
                            <span>Home</span>
                        </Link>

                        <RelatedCount
                            type={'all'}
                            {...baseArgs}
                            className={locMatch['mandala']}
                        />
                        <RelatedCount
                            type={'places'}
                            {...baseArgs}
                            className={locMatch['places']}
                        />
                        <RelatedCount
                            type={'audio-video'}
                            {...baseArgs}
                            className={locMatch['audio-video']}
                        />
                        <RelatedCount
                            type={'images'}
                            {...baseArgs}
                            className={locMatch.images}
                        />
                        <RelatedCount
                            type={'sources'}
                            {...baseArgs}
                            className={locMatch.sources}
                        />
                        <RelatedCount
                            type={'texts'}
                            {...baseArgs}
                            className={locMatch.texts}
                        />
                        <RelatedCount
                            type={'visuals'}
                            {...baseArgs}
                            className={locMatch.visuals}
                        />
                        <RelatedCount
                            type={'subjects'}
                            {...baseArgs}
                            className={locMatch.subjects}
                        />
                        <RelatedCount
                            type={'terms'}
                            {...baseArgs}
                            className={locMatch.terms}
                        />
                        <RelatedCount
                            type={'collections'}
                            {...baseArgs}
                            className={locMatch.collections}
                        />
                    </div>
                </section>

                <section className="l-history__list__wrap">
                    <div className="u-related__list__header">
                        Recently Viewed
                    </div>
                    <HistoryViewer />
                </section>

                {browse_tree && (
                    <section className="l-terms__tree__wrap">
                        <div className="u-related__list__header">
                            Browse{' '}
                            <span className={'text-capitalize'}>
                                {current_domain}
                            </span>
                        </div>

                        {browse_tree}
                    </section>
                )}
            </div>
        </aside>
    );
}

function RelatedCount(props) {
    const count = props.relateds?.assets
        ? props.relateds.assets[props.type]?.count
        : 0;

    // assign shanticon class according to type.  "all" type should get the "shanticon-logo-shanti" icon.
    const iconClass =
        'icon u-icon__' + (props.type === 'all' ? 'logo-shanti' : props.type);

    let display = 'deck';
    if (props.type === 'sources' || props.type === 'texts') {
        display = 'list';
    }
    if (props.type === 'images') {
        display = 'gallery';
    }
    // return null if the count doesn't exist or is === 0
    return count ? (
        <Link
            id={'sui-rl-' + props.type}
            href="#"
            className={'c-related__item c-related__link--' + props.type}
            to={
                '/' +
                props.baseType +
                '/' +
                props.baseUid +
                '/related-' +
                props.type +
                '/' +
                display
            }
        >
            <span className={'u-icon__' + props.type + ' ' + iconClass}></span>
            <span className={'c-related__item__label'}> {props.type}</span>
            <span id="sui-rln-places">{count}</span>
        </Link>
    ) : null;
}
