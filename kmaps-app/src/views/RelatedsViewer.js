import React from 'react';
import { Link, useRouteMatch } from 'react-router-dom';

export function RelatedsViewer(props) {
    console.log('Relateds props = ', props);

    const match = useRouteMatch('/:baseType/:baseUid/related-:type');
    const loc = match?.params.type || 'home';
    let locMatch = {};
    locMatch[loc] = 'selected';

    const baseArgs = {
        baseType: 'terms',
        baseUid: props.id,
        relateds: props.relateds,
    };
    if (!props.id) {
        return null;
    }

    return (
        <div className={'relatedsviewer'}>
            <div className="sui-related">
                RELATED RESOURCES
                <hr />
                <div className="sui-relatedList">
                    <Link to={'/' + baseArgs.baseType + '/' + baseArgs.baseUid}>
                        <div
                            className={`sui-relatedItem  sui-color-terms ${locMatch['home']}`}
                            id="sui-rl-Home"
                        >
                            <span className={'icon sui-relatedItem-icon'}>
                                
                            </span>{' '}
                            <b>Home</b>
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
                    className={'sui-color-' + props.type + ' ' + iconClass}
                ></span>
                <span className={'sui-relatedItem-label'}> {props.type}</span>
                &nbsp;(<span id="sui-rln-places">{count}</span>)
            </span>
        </Link>
    ) : null;
}
