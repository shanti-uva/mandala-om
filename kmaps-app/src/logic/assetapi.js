import jsonpAdapter from 'axios-jsonp';
import axios from 'axios';
import $ from 'jquery';
import React from 'react';

$(document).ready(function () {
    // Use timeout to show not found message because otherwise displays while waiting for JSON to respond
    window.show_not_found = setTimeout(function () {
        $('.loading').hide();
        $('.not-found-msg').show();
    }, 10000);
});

export function getMandalaAssetDataPromise(env, assettype, id) {
    const json_call = getMandalaJSONUrl(env, assettype, id);

    const request = {
        adapter: jsonpAdapter,
        callbackParamName: 'json.wrf',
        url: json_call,
    };

    const promise = new Promise((resolve, reject) => {
        /*let data = getCached(request);
        if (data) {
            resolve(data);
            return;
        }*/
        let data = false;
        axios
            .request(request)
            .then((res) => {
                const data = res.data;
                setCache(request, data);
                resolve(data);
            })
            .catch((reason) => {
                reject(reason);
            });
    });
    return promise;
}

export function getLegacyAssetPromise(env, assettype, id) {
    const json_call = getMandalaSolrUrl(env, assettype, id);

    const request = {
        adapter: jsonpAdapter,
        callbackParamName: 'json.wrf',
        url: json_call,
    };

    const promise = new Promise((resolve, reject) => {
        let data = false; // getCached(request);
        if (data) {
            resolve(data);
            return;
        }
        axios
            .request(request)
            .then((res) => {
                const data = res.data.response.docs[0];
                setCache(request, data);
                resolve(data);
            })
            .catch((reason) => {
                reject(reason);
            });
    });
    return promise;
}

// Build the mandala JSON URL based on environment, app, and ID within app
function getMandalaJSONUrl(menv, mapp, mid) {
    let host = '';
    switch (menv) {
        case 'local':
            host = 'https://' + mapp + '.dd:8443';
            break;
        case 'dev':
            host = 'https://' + mapp + '-dev.shanti.virginia.edu';
            break;
        case 'stage':
            host = 'https://' + mapp + '-stage.shanti.virginia.edu';
            break;
        default:
            host = 'https://' + mapp + '.shanti.virginia.edu';
    }
    let json_call = '';
    // TODO: Adapt for other apps
    switch (mapp) {
        case 'texts':
            json_call = host + '/shanti_texts/node_json/' + mid;
            break;

        default:
            json_call = host;
    }
    return json_call;
}

function getMandalaSolrUrl(env, assettype, id) {
    let solr_base = '';
    switch (env) {
        case 'predev':
            solr_base =
                'https://ss251856-us-east-1-aws.measuredsearch.com/solr/kmassets_predev';
            break;

        case 'dev':
        case 'local':
            solr_base =
                'https://ss251856-us-east-1-aws.measuredsearch.com/solr/kmassets_dev';
            break;

        case 'stage':
            solr_base =
                'https://ss395824-us-east-1-aws.measuredsearch.com/solr/kmassets_stage';
            break;

        default:
            solr_base =
                'https://ss395824-us-east-1-aws.measuredsearch.com/solr/kmassets'; // default to Prod
    }
    const solr_url =
        solr_base +
        '/select?q=asset_type:' +
        assettype +
        '%20AND%20id:' +
        id +
        '&wt=json';
    return solr_url;
}

// Code copied from searchapi.js where it says:
//  TODO: Maybe refactor to use declarative caching instead...?
function getCached(request) {
    let data = null;
    // TODO: Need explicit cache controls and timeouts, etc.
    if (sessionStorage) {
        try {
            const cached = sessionStorage.getItem(JSON.stringify(request));
            if (cached) {
                data = JSON.parse(cached);
            }
        } catch (e) {
            console.log('Ignored sessionStorage error: ', e);
        }
    }
    console.log('getCached: returning: ', data);
    return data;
}

function setCache(request, data) {
    if (sessionStorage) {
        try {
            sessionStorage.setItem(
                JSON.stringify(request),
                JSON.stringify(data)
            );
            //console.log("Cached: data for ", JSON.stringify(request));
        } catch (e) {
            //console.log("Ignored sessionStorage error: ", e);
            // ignore
        }
    }
}

export function clearCache() {
    sessionStorage.clear();
}
