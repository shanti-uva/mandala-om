import axios from 'axios';
import jsonpAdapter from './axios-jsonp';
import $ from 'jquery';
import React from 'react';

$(document).ready(function () {
    // Use timeout to show not found message because otherwise displays while waiting for JSON to respond
    window.show_not_found = setTimeout(function () {
        $('.loading').hide();
        $('.not-found-msg').show();
    }, 10000);
});

export function getMandalaAssetDataPromise(assettype, id) {
    const json_call = getMandalaJSONUrl(assettype, id);

    const request = {
        adapter: jsonpAdapter,
        callbackParamName: 'json_wrf',
        url: json_call,
    };
    const promise = new Promise((resolve, reject) => {
        let calldata = false; // getCached(request);
        if (calldata) {
            resolve(calldata);
            return;
        }
        axios
            .request(request)
            .then((res) => {
                //console.log('res', res);
                const apidata = res.data;
                setCache(request, apidata);
                resolve(apidata);
            })
            .catch((reason) => {
                reject(reason);
            });
    });
    return promise;
}

export function getLegacyAssetPromise(assettype, id) {
    const json_call = getMandalaSolrUrl(assettype, id);

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
function getMandalaJSONUrl(mapp, mid) {
    mapp = mapp.replace('-', '_').toLowerCase();
    const envkey = 'REACT_APP_DRUPAL_' + mapp.toUpperCase();
    if (!(envkey in process.env)) {
        console.error(
            'Drupal App host URL, ' +
                envkey +
                ', not found in React environment variables'
        );
        return '';
    }
    const host = process.env[envkey];
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

function getMandalaSolrUrl(assettype, id) {
    const solr_base = process.env.REACT_APP_SOLR_KMASSETS;
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
