import React from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import FancyTree from './FancyTree';
import HistoryViewer from './History/HistoryViewer';
import './css/RelatedsViewer.css';

export function RelatedsViewer(props) {
    // console.log('Relateds props = ', props);

    const match = useRouteMatch([
        '/:baseType/:baseUid/related-:type',
        '/:baseType/:baseUid',
    ]);
    // console.log('Relateds match = ', match);

    const loc = match?.params.type || 'home';
    let locMatch = {};
    locMatch[loc] = 'selected';

    const baseArgs = {
        baseType: match?.params.baseType || props.kmap?.tree || 'assets',
        baseUid: props.id || match?.params.baseUid,
        relateds: props.relateds,
    };
    if (!props.id && !baseArgs.baseUid) {
        return null;
    }

    return (
        <aside className={'l-column__related'}>
            <div className="l-column__related__wrap">
                <section className="l-related__list__wrap">
                    <div className="l-related__list__header">
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
                    <div className="l-related__list__header">
                        Recently Viewed
                    </div>
                    <HistoryViewer />
                </section>

                <section className="l-termsTree__wrap">
                    <div className="l-related__list__header">Browse Terms</div>
                    <FancyTree
                        domain="terms"
                        tree="terms"
                        descendants={true}
                        directAncestors={false}
                        displayPopup={false}
                        perspective="tib.alpha"
                        view="roman.scholar"
                        sortBy="position_i+ASC"
                    />
                </section>
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
                '/default'
            }
        >
            <span className={'u-icon__' + props.type + ' ' + iconClass}></span>
            <span className={'c-related__item__label'}> {props.type}</span>
            <span id="sui-rln-places">{count}</span>
        </Link>
    ) : null;
}
