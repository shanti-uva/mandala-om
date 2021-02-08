import React from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import jsonpAdapter from '../logic/axios-jsonp';
// import { ReactQueryDevtools } from 'react-query-devtools';

const solrurls = {
    assets: process.env.REACT_APP_SOLR_KMASSETS + '/select',
    terms: process.env.REACT_APP_SOLR_KMTERMS + '/select',
};

/**
 * A async function to perform a solr query provided a query object. The query object needs to have the following properties:
 *      index: (assets|terms),
 *      params: name-value pairs for params for the query
 * For an example, see the useAsset hook
 *
 * @param _
 * @param query
 * @returns {Promise<any>}
 */
const getSolrData = async (query) => {
    if (!(query.index in solrurls) || !query.params) {
        console.warn(
            'The query object sent to useSolr() did not have proper index or params values: ',
            query
        );
        return false;
    }

    let myparams = query.params;
    if (!('wt' in myparams)) {
        myparams['wt'] = 'json';
    }

    const request = {
        adapter: jsonpAdapter,
        callbackParamName: 'json.wrf',
        url: solrurls[query.index],
        params: myparams,
    };
    //console.log('solr request', request);
    const { data } = await axios.request(request);
    let retdata = data && data.response ? data.response : data;
    if (data.facets) {
        retdata['facets'] = data.facets;
    }
    return retdata;
};

/**
 * UseSolr : hook for solr queries
 *
 * @param qkey
 * @param queryobj
 * @returns {any}
 */
export function useSolr(qkey, queryobj) {
    // console.log("useSolr: qkey = ", qkey, " queryobj = ", queryobj);
    // split qkey by '-' and pass array as key
    return useQuery(qkey.split('-'), () => getSolrData(queryobj));
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
    const res = useQuery(qkey.split('-'), () => getSolrData(queryobj), {
        enabled: depvar,
    });
    if (res && res.data) {
        res.data['status'] = res.status;
        return res.data;
    }
    return false;
}

/**
 * Example of chained, dependent queries with the useSolr() and useSolrEnabled() hook.
 * Finds record for place with header "Lhasa" and ADM3, then with its kmap ID finds all
 * assets tagged with that place.
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
function TestComp(props) {
    const testquery = {
        index: 'terms',
        params: {
            q: 'header:Lhasa AND tree:places AND feature_types:ADM3',
            rows: 1,
        },
    };
    const res1 = useSolr('tqry', testquery);
    let { numFound, start, docs } = res1
        ? res1
        : { numFound: 0, start: 0, docs: [] };
    const kmapid = docs && docs.length > 0 ? docs[0].id : false;

    const q2 = {
        index: 'assets',
        params: {
            q: 'kmapid:' + kmapid,
            fl: 'id,uid',
            rows: 25,
        },
    };
    const results = useSolrEnabled('newtsq', q2, res1);

    let nf = '?';
    let adocs = [];
    if (results) {
        console.log('res data', results);
        nf = results.numFound;
        adocs = JSON.stringify(results.docs, null, 2);
    }
    return (
        <>
            <p>
                Lhasa's kmid is: {kmapid}. Found {nf} assets connected with it:{' '}
            </p>
            <pre>{adocs}</pre>
        </>
    );
}
