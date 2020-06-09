import KmapsSolrUtil from '../legacy/kmapsSolrUtil';
import axios from 'axios';
import jsonpAdapter from 'axios-jsonp';
import _ from 'lodash';

export async function search(searchstate) {
    // TODO:  need to pass configuration.   Otherwise dev defaults are used.
    const ksolr = new KmapsSolrUtil();

    function adaptState(searchstate) {
        // adjust state if necessary
        const adaptedState = searchstate.map(x => x);
        return adaptedState;
    }

    const adaptedState = adaptState(searchstate);
    const solrQueryUrl = ksolr.createBasicQuery(adaptedState);

    await fetch(solrQueryUrl)
        .then(res => (res.ok ? res : Promise.reject(res)))
        .then(res => res.json())
}

function getCached(request) {
    let data = null;
    if (false && sessionStorage) {
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

export function getAssetDataPromise(kmapid) {

        const host = 'ss251856-us-east-1-aws.measuredsearch.com';
        const index = 'kmassets_dev';
        const selectUrl = 'https://' + host + '/solr/' + index + '/select';
        const startRec = 0;
        const rowsRec = 1;

        const request = {
            'adapter': jsonpAdapter,
            'callbackParamName': 'json.wrf',
            'url': selectUrl,
            'params': {
                'fl': '*',
                'wt': 'json',
                'echoParams': 'explicit',
                'indent': 'true',
                'start': startRec,
                'rows': rowsRec,
                'q': 'uid:${kmapid}',
                'kmapid': kmapid
            }
        }

        const promise = new Promise((resolve, reject) => {
            let data = getCached(request);
            if (data) {
                resolve(data);
                return;
            }

            console.log("getAssetDataPromise(): Calling axios:");
            axios.request(request).then((res) => {
                console.log("getAssetDataPromise():  Yay! axios call succeeded!", res);
                const data = res.data.response.docs[0];
                setCache(request, data);
                resolve(data);
            }).catch(reason => {
                console.log("gertAssetDataPromise(): OUCH axios call failed!", reason);
                reject(reason);
            });
        });
        return promise;


}

export function getFullKmapDataPromise(kmapid) {

    const host = 'ss251856-us-east-1-aws.measuredsearch.com';
    const index = 'kmterms_dev';
    const selectUrl = 'https://' + host + '/solr/' + index + '/select';
    const startRec = 0;
    const rowsRec = 1;

    const request = {
        'adapter': jsonpAdapter,
        'callbackParamName': 'json.wrf',
        'url': selectUrl,
        'params': {
            'fl':'*,[child parentFilter=block_type:parent limit=1000]',
            'wt': 'json',
            'echoParams': 'explicit',
            'indent': 'true',
            'start': startRec,
            'rows': rowsRec,
            'q': 'uid:${kmapid}',
            'kmapid': kmapid
        }
    }

    const promise = new Promise((resolve, reject) => {
        let data = getCached(request);
        if (data) {
            resolve(data);
            return;
        }
        console.log("getFullKmapDataPromise(): Calling axios:")
        axios.request(request).then((res) => {
            console.log("getFullKmapDataPromise(): Yay! axios call succeeded!", res);
            const data = cleanKmapData(res.data.response.docs[0]);
            setCache(request,data);
            resolve(data);
        }).catch(reason => {
            console.log("getFullKmapDataPromise(): OUCH axios call failed!", reason);
            reject(reason);
        });
    });
    return promise;


}



function cleanKmapData( data ) {

    console.log("clean kmap data = ", data);

    return data;
}



export function getRelatedAssetsPromise(kmapid, type, start, rows ) {

    console.log( "getRelatedAssetsPromise() Promising: ", arguments);
    const host = 'ss251856-us-east-1-aws.measuredsearch.com';
    const index = 'kmassets_dev';
    const selectUrl = 'https://' + host + '/solr/' + index + '/select';
    const defaultStart = 0;
    const defaultRows = 100;

    const ALL = ["audio-video","images","texts","visuals","sources","subjects","places","terms"];

    const asset_types = (typeof type ==="undefined" || type === "all" )?ALL:[ type ];
    const startRec = (typeof start === "undefined" )?defaultStart:start;
    const rowsRec = (typeof rows === "undefined")?defaultRows:rows;

    console.log("getRelatedAssetsPromise: start = " + startRec + " rows = " + rowsRec);


    const facetJson = JSON.stringify({
        'asset_counts': {
            'limit': 20,
            'type': 'terms',
            'field': 'asset_type',
            'domain': {'excludeTags': 'ast'}
        }
    });

    const request = {
        'adapter': jsonpAdapter,
        'callbackParamName': 'json.wrf',
        'url': selectUrl,
        'params': {
            'fl': '*',
            'wt': 'json',
            'echoParams': 'explicit',
            'indent': 'true',
            'start': startRec,
            'rows': rowsRec,
            'json.facet': facetJson,
            'q': '(uid:${kmapid}^100+kmapid:${kmapid})',
            'kmapid': kmapid,
            'fq': '{!tag=ast}asset_type:( ' + asset_types.join(' ') + ')'
        }
    }

    const unpackResponse = (res) => {

        console.log("unpacking asset_counts: ", res.data.facets);

        const buckets = res.data.facets.asset_counts.buckets;

        let asset_counts = {
            "all" : { "count" : 0, "docs": res.data.response.docs }
        };
        buckets.forEach( (x) => {
            asset_counts[x.val] = { count: x.count, docs: [] };
            asset_counts["all"].count += x.count;
        });

        console.log("unpacking assets: ", res.data.response.docs);
        const docs = res.data.response.docs;




        docs.forEach( (x) => {
           const y =  cleanAssetData(x);
           asset_counts[ x.asset_type ].docs.push(y);
        });

        return { uid: kmapid, start: start, rows: rows, type: type, stateKey: [kmapid,type,start,rows].join("/"), assets: asset_counts };
    };

    const promise = new Promise((resolve, reject) => {
        let data = getCached(request);
        if (data) {
            resolve(data);
            return;
        }
        console.log("getRelatedAssetsPromise(): Calling axios:")
        axios.request(request).then((res) => {
            console.log("getRelatedAssetsPromise():  Yay! axios call succeeded!", res);
            const data = unpackResponse(res);
            setCache(request,data);
            resolve(data);
        }).catch(reason => {
            console.log("getRelatedAssetsPromise(): OUCH axios call failed!", reason);
            reject(reason);
        });
    });
    return promise;

}

function cleanAssetData( data ) {

    const asset_type = data.asset_type;
    switch (asset_type) {
        case 'texts':
        case 'sources':
        case 'subjects':
        case 'places':
        case 'terms':
            data.url_thumb = "/mandala-om/gradient.jpg";
            break;
    }

    console.log("clean thumb = " , data.url_thumb);

    console.log("returning clean: ", data);
    return data;
}