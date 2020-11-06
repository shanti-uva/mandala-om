import React from 'react';
import _ from 'lodash';
import './RelatedsViewer.scss';
import { Link } from 'react-router-dom';
import { useSolr } from '../../../hooks/useSolr';

export function RelatedsIcons(props) {
    const domain = props.domain;
    const id = props.kid;
    const kmid = `${domain}-${id}`;
    const query = {
        index: 'assets',
        params: {
            q: `kmapid:${kmid}`,
            rows: 0,
            'json.facet': '{related_count:{type:terms,field:asset_type}}',
        },
    };
    const { facets } = useSolr(kmid, query);
    let buckets = { length: 0 };
    if (facets && facets.related_count?.buckets) {
        buckets.length = facets.related_count.buckets.length;
        for (let bn = 0; bn < facets.related_count.buckets.length; bn++) {
            const bkt = facets.related_count.buckets[bn];
            buckets[bkt.val] = bkt.count;
        }
    }
    const atypes = [
        'subjects',
        'places',
        'terms',
        'audio-video',
        'picture',
        'sources',
        'texts',
        'visuals',
    ];
    return (
        <ul className={'c-relateds-icons'}>
            {_.map(atypes, (atype) => {
                if (buckets[atype]) {
                    return (
                        <RelatedIcon
                            key={domain + id + atype}
                            domain={domain}
                            id={id}
                            asset_type={atype}
                            number={buckets[atype]}
                        />
                    );
                }
            })}
        </ul>
    );
}

function RelatedIcon(props) {
    const asset_type =
        props.asset_type === 'picture' ? 'images' : props.asset_type;
    const hrefval = `/${props.domain}/${props.domain}-${props.id}/related-${asset_type}/default`;
    let mycount = props.number;
    return (
        <li className={asset_type} title={asset_type}>
            <div>
                <Link to={hrefval}>
                    <div>
                        <span className={`icon shanticon-${asset_type}`} />
                        <span className="kmaps-results-name">{asset_type}</span>
                        <span className="badge">{mycount}</span>
                    </div>
                </Link>
            </div>
        </li>
    );
}
