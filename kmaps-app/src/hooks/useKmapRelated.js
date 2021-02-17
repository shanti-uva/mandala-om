import { useQuery } from 'react-query';
import axios from 'axios';
import jsonpAdapter from '../logic/axios-jsonp';
import { getSolrUrls } from './utils';

// Declare all needed constants.
const solr_urls = getSolrUrls();
const ALL = [
    'audio-video',
    'images',
    'texts',
    'visuals',
    'sources',
    'subjects',
    'places',
    'terms',
];
const facetJson = JSON.stringify({
    asset_counts: {
        limit: 20,
        type: 'terms',
        field: 'asset_type',
        domain: { excludeTags: 'ast' },
    },
});

/**
 * useKmapRelated is a custom React Hook implementing useQuery from react-query to query
 * SOLR indices for information concerning kmaps related assets and their counts.
 *
 * @param kmapid
 * @param type
 * @param start
 * @param rows
 * @returns {any}
 */
export function useKmapRelated(
    kmapid,
    type = 'all',
    start = 0,
    rows = 100,
    definitionID = 'noDefID'
) {
    const asset_types = type === 'all' ? ALL : [type];

    return useQuery(
        [
            'kmapRelated',
            kmapid,
            asset_types.join('-'),
            start,
            rows,
            definitionID,
        ],
        () =>
            getKmapRelatedData(kmapid, asset_types, start, rows, definitionID),
        { keepPreviousData: true }
    );
}

const getKmapRelatedData = async (
    kmapid,
    asset_types,
    start,
    rows,
    definitionID
) => {
    const defID =
        definitionID === 'noDefID' || String(definitionID) === 'any'
            ? kmapid
            : definitionID;

    let params = {
        fl: '*',
        wt: 'json',
        start: start,
        rows: rows,
        'json.facet': facetJson,
        // eslint-disable-next-line
        q: `(uid:${kmapid}^100+kmapid:${defID})`,
        kmapid: kmapid,
        fq: '{!tag=ast}asset_type:(' + asset_types.join(' ') + ')',
    };

    const request = {
        adapter: jsonpAdapter,
        callbackParamName: 'json.wrf',
        url: solr_urls.assets,
        params: params,
    };

    const { data } = await axios.request(request);
    return data;
};
