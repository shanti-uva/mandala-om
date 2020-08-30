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
        <div className={'relatedsviewer'}>
            <div className="sui-related">
                <div className="sui-relatedList__wrapper">
                    RELATED RESOURCES
                    <hr />
                    <div className="sui-relatedList">
                        <Link
                            to={
                                '/' + baseArgs.baseType + '/' + baseArgs.baseUid
                            }
                        >
                            <div
                                className={`sui-relatedItem  u-color__terms ${locMatch['home']}`}
                                id="sui-rl-Home"
                            >
                                <span
                                    className={'icon u-icon__overview'}
                                ></span>{' '}
                                FRONT
                            </div>
                        </Link>

                        <RelatedCount
                            type={'all'}
                            {...baseArgs}
                            className={locMatch['all']}
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
                </div>
                <div className="sui-recently-viewed__wrapper">
                    RECENTLY VIEWED
                    <hr />
                    <HistoryViewer />
                </div>
                <div className="sui-termsTree__wrapper">
                    BROWSE TERMS
                    <hr />
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
                </div>
            </div>
        </div>
    );
}

function RelatedCount(props) {
    const count = props.relateds?.assets
        ? props.relateds.assets[props.type]?.count
        : 0;

    // assign shanticon class according to type.  "all" type should get the "shanticon-logo-shanti" icon.
    const iconClass =
        'icon shanticon-' + (props.type === 'all' ? 'logo-shanti' : props.type);

    // return null if the count doesn't exist or is === 0
    return count ? (
        <Link
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
            <span
                className={'sui-relatedItem ' + props.className}
                id={'sui-rl-' + props.type}
                href="#"
            >
                <span
                    className={'u-color__' + props.type + ' ' + iconClass}
                ></span>
                <span className={'sui-relatedItem-label'}> {props.type}</span>
                &nbsp;(<span id="sui-rln-places">{count}</span>)
            </span>
        </Link>
    ) : null;
}
