import React from 'react';
import { Link } from 'react-router-dom';

export function RelatedsViewer(props) {
    console.log('Relateds props = ', props);

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
                    <Link
                        to={
                            '/view/' +
                            baseArgs.baseType +
                            '/' +
                            baseArgs.baseUid
                        }
                    >
                        <div
                            className="sui-relatedItem  sui-color-terms"
                            id="sui-rl-Home"
                        >
                            <span className={'icon sui-relatedItem-icon'}>
                                
                            </span>{' '}
                            <b>Home</b>
                        </div>
                    </Link>

                    <RelatedCount type={'all'} {...baseArgs} />
                    <RelatedCount type={'places'} {...baseArgs} />
                    <RelatedCount type={'audio-video'} {...baseArgs} />
                    <RelatedCount type={'images'} {...baseArgs} />
                    <RelatedCount type={'sources'} {...baseArgs} />
                    <RelatedCount type={'texts'} {...baseArgs} />
                    <RelatedCount type={'visuals'} {...baseArgs} />
                    <RelatedCount type={'subjects'} {...baseArgs} />
                    <RelatedCount type={'terms'} {...baseArgs} />
                    <RelatedCount type={'collections'} {...baseArgs} />
                </div>
            </div>
        </div>
    );
}

function RelatedCount(p) {
    const count = p.relateds?.assets ? p.relateds.assets[p.type]?.count : 0;

    // assign shanticon class according to type.  "all" type should get the "shanticon-logo-shanti" icon.
    const iconClass =
        'icon shanticon-' + (p.type === 'all' ? 'logo-shanti' : p.type);

    // return null if the count doesn't exist or is === 0
    return count ? (
        <Link
            to={
                '/view/' +
                p.baseType +
                '/' +
                p.baseUid +
                '/related/' +
                p.type +
                '/default'
            }
        >
            <span
                className={'sui-relatedItem'}
                id={'sui-rl-' + p.type}
                href="#"
            >
                <span
                    className={'sui-color-' + p.type + ' ' + iconClass}
                ></span>
                <span className={'sui-relatedItem-label'}> {p.type}</span>
                &nbsp;(<span id="sui-rln-places">{count}</span>)
            </span>
        </Link>
    ) : null;
}
