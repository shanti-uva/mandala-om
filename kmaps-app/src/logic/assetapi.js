import jsonpAdapter from 'axios-jsonp';
import axios from "axios";


export function getMandalaAssetDataPromise(app, id) {
    const env = 'local';
    const json_call = getMandalaJSONUrl(app, id);

    //const selectUrl = 'https://' + host + '/solr/' + index + '/select';

    const request = {
        'adapter': jsonpAdapter,
        'callbackParamName': 'json.wrf',
        'url': json_call
    }

    const promise = new Promise((resolve, reject) => {
        let data = getCached(request);
        if (data) {
            resolve(data);
            return;
        }

        console.log("getMandalaAssetDataPromise(): Calling axios:");
        axios.request(request).then((res) => {
            console.log("getMandalaAssetDataPromise():  Yay! axios call succeeded!", res);
            const data = res.data.response.docs[0];
            setCache(request, data);
            resolve(data);
        }).catch(reason => {
            console.log("getMandalaAssetDataPromise(): OUCH axios call failed!", reason);
            reject(reason);
        });
    });
    return promise;
}

// Build the mandala JSON URL based on environment, app, and ID within app
function getMandalaJSONUrl(menv, mapp, mid) {
    let host = '';
    switch(menv) {
        case "local":
            host = 'https://' + mapp + '.dd:8443';
            break;
        case "dev":
            host = 'https://' + mapp + '-dev.shanti.virginia.edu';
            break;
        case "stage":
            host = 'https://' + mapp + '-stage.shanti.virginia.edu';
            break;
        default:
            host = 'https://' + mapp + '.shanti.virginia.edu';
    }
    let json_call = '';
    // TODO: Adapt for other apps
    switch(mapp) {
        case 'texts':
            json_call = host + "/shanti_texts/node_json/" + mid;
            break;

        default:
            json_call = host;
    }
    return json_call;
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
            console.log("Ignored sessionStorage error: ", e);
        }
    }
    console.log("getCached: returning: ", data);
    return data;
}

function setCache(request, data) {
    if (sessionStorage) {
        try {
            sessionStorage.setItem(JSON.stringify(request), JSON.stringify(data));
            console.log("Cached: data for ", JSON.stringify(request));
        } catch (e) {
            console.log("Ignored sessionStorage error: ", e);
            // ignore
        }
    }
}

export function clearCache() {
    sessionStorage.clear();
}
