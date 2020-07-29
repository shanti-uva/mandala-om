import React from 'react';
import { useQuery, queryCache } from 'react-query';
import axios from 'axios';
import jsonpAdapter from '../logic/axios-jsonp';

const solrurls = getSolrUrls(process.env.NODE_ENV);

/**
 * A async function to perform a solr query provided a query object. The query object needs to have the following properties:
 *      index: (assets|terms),
 *      params: name-value pairs for params for the query
 *      dataFilter: (optional) function to filter data
 * @param _
 * @param query
 * @returns {Promise<any>}
 */
const getSolrData = async (_, { query }) => {
    if (!(query.index in solrurls)) {
        console.warn(
            'A solr index labeled, ' +
                query.index +
                ', does not exist. Cannot perform query:',
            query
        );
        return false;
    }

    let myparams = query.params;
    if (!('wt' in myparams)) {
        myparams['wt'] = 'json';
    }

    const myfilter =
        'dataFilter' in query
            ? query.dataFilter
            : () => {
                  return false;
              };

    const request = {
        adapter: jsonpAdapter,
        callbackParamName: 'json.wrf',
        url: solrurls[query.index],
        params: myparams,
        transformResponse: function (data) {
            const filtered_data = myfilter(data);
            return filtered_data ? filtered_data : data;
        },
    };
    const { data } = await axios.request(request);

    return data;
};

/**
 * UseSolr : hook for solr queries
 *
 * @param qkey
 * @param queryobj
 * @returns {any}
 */
export function useSolr(qkey, queryobj) {
    return useQuery([qkey, { query: queryobj }], getSolrData);
}

/**
 * UseSolr : hook for solr queries
 *
 * @param qkey
 * @param queryobj
 * @param depvar
 * @returns {any}
 */
export function useSolrEnabled(qkey, queryobj, depvar) {
    return useQuery([qkey, { query: queryobj }], getSolrData, {
        enabled: depvar,
    });
}

/**
 * A function to get the proper Solr base URL for the current environment.
 * Returns an object with both an assets and a terms property that contains the base url to that index
 * for the given environment. Uses environment variables set by .env files for each environment
 * @param env
 * @returns {{assets: string, terms: string}}
 */
function getSolrUrls(env) {
    return {
        assets: process.env.REACT_APP_SOLR_KMASSETS + '/select',
        terms: process.env.REACT_APP_SOLR_KMTERMS + '/select',
    };
}
