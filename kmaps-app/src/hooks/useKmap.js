import React from 'react';
import { useQuery, queryCache } from 'react-query';
import axios from 'axios';
import jsonpAdapter from '../logic/axios-jsonp';

const solr_urls = getSolrUrls(process.env.NODE_ENV);

/**
 *  "queries" object lists different queries by their key. Each query is an object defining:
 *      url: the base url for the query
 *      params: an object of named parameters and values for the query. Queries can have variables,
 *              _DOMAIN_ for the domain placeholder, and _KID_ for the kmaps ID placeholder
 *      dataFilter: if a function that takes the raw data returned from axios and filters it in a custom way
 *                  to return the desired portion of the result.
 */
const queries = {
    info: {
        url: solr_urls.terms,
        params: {
            q: 'uid:_DOMAIN_-_KID_',
            fl: '*',
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
            q: 'kmapid:_DOMAIN_-_KID_',
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

const getKmapData = async (_, { qtype, domain, kid }) => {
    // console.log("getKmapData ", _, qtype, domain, kid);

    // ys2n:
    // Need to copy this way to prevent overwriting the templates in queries
    // Can't use deep JSON copy because that doesn't copy functions.
    const query = { ...queries[qtype] }; // shallow copy
    query.params = { ...query.params }; // deeper copy of params

    for (let key in query.params) {
        query.params[key] = query.params[key]
            .replace('_DOMAIN_', domain)
            .replace('_KID_', kid);
    }
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
    console.log('Axios request/response = ', request, data);
    return data;
};

/**
 * useKmap is a custom React Hook implementing useQuery from react-query to query SOLR indices for information concerning
 * kmaps subjects, places, and terms. The types of queries are defined in the "queries" object above.
 *
 * @param domain
 * @param kid
 * @param query_type
 * @returns {any}
 */
export function useKmap(domain, kid, query_type) {
    // console.log("useKmap: domain = ", domain, " kid = ", kid, " query_type = ",  query_type );
    query_type = typeof query_type === 'undefined' ? 'info' : query_type;
    return useQuery(
        ['kmap', { qtype: query_type, domain: domain, kid: kid }],
        getKmapData
    );
    /*
    if ( isLoading ) { console.log("loading " + domain + '-' + kid); return false; }
    if ( isError ) {
        console.error("useKmap Error: ", error);
        return false;
    }
    if (status === 'success') {
        // Filter out extra info in results from useQuery, return only data as filtered above if exists
        const results = (respdata && respdata.data && respdata.data.data) ? respdata.data.data : respdata;
        return results;
    }
     */
}

/**
 * GetKmapData is the function that makes the Axios call to SOLR based on the query specifics chosen.
 * The parameter, qtype, is the key index for the queries object that retrieves the URL, params, and result filter
 * for the desired query. The result filter is a function that takes the raw data returned from the axios query and
 * filters it to return only the desired portion.
 *
 * @param id
 * @param qtype
 * @param domain
 * @param kid
 * @returns {*}
 */
/*
function OldgetKmapData(id, {qtype, domain, kid}) {
    //console.log("in getKmapData: " + [qtype, domain, kid].join(", "));
    const query = queries[qtype];
    for (let key in query.params) {
        query.params[key] = query.params[key]
            .replace('_DOMAIN_', domain)
            .replace('_KID_', kid);
    }
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
    return axios.request(request);
}
*/

/**
 * A function to get the proper Solr base URL for the current environment.
 * Returns an object with both an assets and a terms property that contains the base url to that index
 * for the given environment. TODO: Do we need a terms /query url?
 * @param env
 * @returns {{assets: string, terms: string}}
 */
function getSolrUrls(env) {
    switch (env) {
        case 'development':
            return {
                assets:
                    ' https://ss251856-us-east-1-aws.measuredsearch.com/solr/kmassets_dev/select',
                terms:
                    'https://ss251856-us-east-1-aws.measuredsearch.com/solr/kmterms_dev/select',
            };
            break;

        case 'test':
            return {
                assets:
                    'https://ss395824-us-east-1-aws.measuredsearch.com/solr/kmassets_stage/select',
                terms:
                    'https://ss395824-us-east-1-aws.measuredsearch.com/solr/kmterms_stage/select',
            };
            break;

        case 'production':
            return {
                assets:
                    'https://ss395824-us-east-1-aws.measuredsearch.com/solr/kmassets/select',
                terms:
                    'https://ss395824-us-east-1-aws.measuredsearch.com/solr/kmterms_prod/select',
            };
            break;
    }
}
