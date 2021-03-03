import { useQuery } from 'react-query';
import axios from 'axios';
import jsonpAdapter from '../logic/axios-jsonp';
import { getSolrUrls } from './utils';

const solr_urls = getSolrUrls();

/**
 *  "queries" object lists different queries by their key. Each query is an object defining:
 *      url: the base url for the query
 *      params: an object of named parameters and values for the query. Queries can have variables,
 *              _DOMAIN_ for the domain placeholder, and _KID_ for the kmaps ID placeholder
 *      dataFilter: is a function that takes the raw data returned from axios and filters it in a custom way
 *                  to return the desired portion of the result.
 */
const queries = (id) => {
    return {
        info: {
            url: solr_urls.terms,
            params: {
                q: `uid:${id}`,
                fl: '*,[child parentFilter=block_type:parent limit=1000]',
                start: 0,
                rows: 1,
            },
            dataFilter: function (data) {
                return data.response && data.response.numFound > 0
                    ? data.response.docs[0]
                    : false;
            },
        },
        asset: {
            url: solr_urls.assets,
            params: {
                q: `uid:${id}`,
                fl: '*',
                start: 0,
                rows: 1,
            },
            dataFilter: function (data) {
                return data.response && data.response.numFound > 0
                    ? data.response.docs[0]
                    : false;
            },
        },
        related: {
            url: solr_urls.assets,
            params: {
                q: `kmapid:${id}`,
                start: '0',
                facets: 'on',
                group: 'true',
                'group.field': 'asset_type',
                'group.ngroups': 'true',
                'group.limit': '0',
            },
            dataFilter: function (data) {
                return data.grouped && data.grouped.asset_type
                    ? data.grouped.asset_type.groups
                    : false;
            },
        },
    };
};

const getKmapData = async (id, qtype) => {
    // console.log("getKmapData ", _, qtype, domain, kid);

    // ys2n:
    // Need to copy this way to prevent overwriting the templates in queries
    // Can't use deep JSON copy because that doesn't copy functions.
    const query = { ...queries(id)[qtype] }; // shallow copy
    query.params = { ...query.params }; // deeper copy of params

    // Most kmap queries are wt=json. So added here by default.
    let myparams = query.params;
    if (!('wt' in myparams)) {
        myparams['wt'] = 'json';
    }
    const request = {
        adapter: jsonpAdapter,
        callbackParamName: 'json.wrf',
        url: query.url,
        params: myparams,
        transformResponse: function (data) {
            const filtered_data = query.dataFilter(data);
            return filtered_data ? filtered_data : data;
        },
    };
    const { data } = await axios.request(request);
    // console.log("Axios request params = ", myparams);
    // console.log('Axios request/response = ', request, data);
    return data;
};

/**
 * useKmap is a custom React Hook implementing useQuery from react-query to query SOLR indices for information concerning
 * kmaps subjects, places, and terms. The types of queries are defined in the "queries" object above.
 *
 * @param domain
 * @param kid
 * @param query_type (info|related)
 * @returns {any}
 */
export function useKmap(id, query_type, byPass = false) {
    query_type = typeof query_type === 'undefined' ? 'info' : query_type;
    return useQuery(
        ['kmap', id, query_type],
        () => getKmapData(id, query_type),
        { enabled: !byPass }
    );
}
