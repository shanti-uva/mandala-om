import axios from 'axios';
import jsonpAdapter from './axios-jsonp';
import crypto from 'crypto';
import _ from 'lodash';
import localforage from 'localforage';
// import Qs from 'qs';
import spexLib from 'spex';

const spex = spexLib(Promise);

function checksum(data) {
    return crypto.createHash('sha1').update(data).digest('base64');
}

export async function search(searchstate) {
    return await getAssetSearchPromise(searchstate);
}

//  TODO: Maybe refactor to use declarative caching instead...?
function getCached(request) {
    localforage
        .getItem(checksum(JSON.stringify(request)))
        .then((data) => {
            return data;
        })
        .catch((err) => {
            console.log('getCached failed.  Returning null: ', err);
            return null;
        });
}

function setCache(request, data) {
    localforage
        .setItem(checksum(JSON.stringify(request)), data)
        .then(() => {
            // localForage.length().then((length) => {
            //     console.log('localForage length = ', length);
            //     console.log('localForage driver = ', localForage.driver());
            // });
        })
        .catch((err) => {
            console.log('setCache failed.  Ignoring: ', err);
        });
}

export function clearCache() {
    localforage
        .clear()
        .then(() => {
            console.log('cache cleared successfully');
        })
        .catch((err) => {
            console.log('ERROR: Failed to clear cache: ', err);
        });
}

function narrowData(data, narrowFilters) {
    // console.log('narrowData called with data = ', data);

    Object.entries(narrowFilters).forEach((x) => {
        const [key, searchObj] = x;
        const search = searchObj.search;
        // const limit = searchObj.limit || 500;
        // const offset = searchObj.offset || 0;
        // const sort = searchObj.sort || "alpha";
        // console.log(' search = ' + search);
        // console.log(" limit = " + limit);
        // console.log(" offset = " + offset);
        // console.log(" sort = " + sort);
        let facet = '';
        if (key === 'subjects') {
            facet = 'related_subjects';
        } else if (key === 'places') {
            facet = 'related_places';
        } else if (key === 'terms') {
            facet = 'related_terms';
        } else if (key === 'users') {
            facet = 'node_user';
        } else {
            facet = key;
        }

        if (data.facets && data.facets[facet]) {
            const buckets = data.facets[facet].buckets;
            const filtered = _.filter(buckets, (x) => {
                const str = x.val.split('|')[0].toLowerCase();
                return str.includes(search);
            });
            // console.log(' setting bucket with facet= ', facet);
            data.facets[facet].buckets = filtered;
        }
    });
    return data;
}

export function getAssetSearchPromise(search) {
    // console.error("searchapi.getAssetSearchPromise who's calling me? with ", search);
    // TODO: parameterize the use of facets
    // TODO: parameterize constructTextQuery

    //console.log("UNPACKING search: ", search);
    const { page, query } = search;

    //console.log("UNPACKING page: ", page);
    // console.log('UNPACKING query: ', query);

    const host = 'ss251856-us-east-1-aws.measuredsearch.com';
    const index = 'kmassets_dev';
    const selectUrl = 'https://' + host + '/solr/' + index + '/select';
    const startRec = page.start || 0;
    const rowsRec = page.rows || 100;

    // const qaxios = axios.create({
    //     paramsSerializer: (params) =>
    //         Qs.stringify(params, { arrayFormat: 'repeat' }),
    // });

    let filters = [];

    const ff = query.facetFilters;
    // console.log('UNPACKING facetFilters: ', query.facetFilters);
    // Object.entries(query.facetFilters).forEach((x) => {
    //     const [key, searchObj] = x;
    //     const search = searchObj.search;
    //     const limit = searchObj.limit || 500;
    //     const offset = searchObj.offset || 0;
    //     const sort = searchObj.sort || "alpha";
    //     console.log(" search = " + search);
    //     console.log(" limit = " + limit);
    //     console.log(" offset = " + offset);
    //     console.log(" sort = " + sort);
    //     let facet = "";
    //     if (key === "subjects") {
    //         facet = "related_subjects";
    //     } else if (key === "places") {
    //         facet = "related_places"
    //     } else if (key === "terms") {
    //         facet = "related_terms";
    //     } else if (key === "users") {
    //         facet = "node_user";
    //     } else {
    //         facet = key;
    //     }
    // });

    // TODO: Parameterize facets.  e.g. You won't need all of them, every time.
    const jsonFacet = {
        asset_count: {
            type: 'terms',
            field: 'asset_type',
            limit: ff['asset_type']?.limit || 20,
            offset: ff['asset_type']?.offset || 0,
            sort: ff['asset_type']?.sort || 'count desc',
            domain: { excludeTags: 'asset_type' },
        },
        related_subjects: {
            type: 'terms',
            field: 'kmapid_subjects_idfacet',
            limit: ff['subjects']?.limit || 500,
            offset: ff['subjects']?.offset || 0,
            sort: ff['subjects']?.sort || 'count desc',
        },
        related_places: {
            type: 'terms',
            field: 'kmapid_places_idfacet',
            limit: ff['places']?.limit || 500,
            offset: ff['places']?.offset || 0,
            sort: ff['places']?.sort || 'count desc',
        },
        related_terms: {
            type: 'terms',
            field: 'kmapid_terms_idfacet',
            limit: ff['terms']?.limit || 500,
            offset: ff['terms']?.offset || 0,
            sort: ff['terms']?.sort || 'count desc',
        },
        feature_types: {
            type: 'terms',
            field: 'feature_types_idfacet',
            limit: ff['feature_types']?.limit || 500,
            offset: ff['feature_types']?.offset || 0,
            sort: ff['feature_types']?.sort || 'count desc',
        },
        languages: {
            type: 'terms',
            field: 'node_lang',
            limit: ff['languages']?.limit || 500,
            offset: ff['languages']?.offset || 0,
            sort: ff['languages']?.sort || 'count desc',
        },
        collections: {
            type: 'terms',
            field: 'collection_idfacet',
            limit: ff['collections']?.limit || 500,
            offset: ff['collections']?.offset || 0,
            sort: ff['collections']?.sort || 'count desc',
        },

        collection_nid: {
            type: 'terms',
            field: 'collection_nid',
            limit: ff['collection_nid']?.limit || 500,
            offset: ff['collection_nid']?.offset || 0,
            sort: ff['collection_nid']?.sort || 'count desc',
        },
        collection_uid: {
            type: 'terms',
            field: 'collection_uid_s',
            limit: ff['collection_uid']?.limit || 500,
            offset: ff['collection_uid']?.offset || 0,
            sort: ff['collection_uid']?.sort || 'count desc',
        },
        asset_subtype: {
            type: 'terms',
            field: 'asset_subtype',
            facet: {
                parent_type: {
                    limit: 1,
                    type: 'terms',
                    field: 'asset_type',
                },
            },
            limit: ff['asset_subtype']?.limit || 500,
            offset: ff['asset_subtype']?.offset || 0,
            sort: ff['asset_subtype']?.sort || 'count desc',
        },
        node_user: {
            type: 'terms',
            field: 'node_user_full_s',
            limit: ff['user']?.limit || 500,
            offset: ff['user']?.offset || 0,
            sort: ff['user']?.sort || 'count desc',
        },
        creator: {
            type: 'terms',
            field: 'creator',
            limit: ff['creator']?.limit || 500,
            offset: ff['creator']?.offset || 0,
            sort: ff['creator']?.sort || 'count desc',
        },
        perspective: {
            type: 'terms',
            field: 'perspectives_ss',
            limit: ff['perspective']?.limit || 50,
            offset: ff['perspective']?.offset || 0,
            sort: ff['perspective']?.sort || 'count desc',
        },
        associated_subjects: {
            type: 'terms',
            field: 'associated_subject_map_idfacet',
            limit: ff['associated_subjects']?.limit || 50,
            offset: ff['associated_subjects']?.offset || 0,
            sort: ff['associated_subjects']?.sort || 'count desc',
        },
    };

    // console.log('FACETING: ' + JSON.stringify(jsonFacet, undefined, 2));

    let params = {
        fl: '*',
        wt: 'json',
        echoParams: 'explicit',
        indent: 'true',
        start: startRec,
        rows: rowsRec,
        // eslint-disable-next-line
        // 'q': 'text:${text}',
        // 'text': search.query.searchText,
        'json.facet': JSON.stringify(jsonFacet),
    };

    const queryParams = constructTextQuery(search.query.searchText);
    const filterParams = constructFilters(search.query.filters);

    params = { ...params, ...queryParams, ...filterParams };

    const request = {
        adapter: jsonpAdapter,
        callbackParamName: 'json.wrf',
        url: selectUrl,
        params: params,
    };

    const searchPromise = new Promise((resolve, reject) => {
        const cached = getCached(request);
        if (false && cached) {
            // console.log('Returning cached data: ', cached);
            resolve(cached);
            return;
        }

        // performance.mark('getAssetSearchPromise:start');
        axios
            .request(request)
            .then((res) => {
                //                 console.log('getAssetSearchPromise():  Yay! axios call succeeded!', res);
                //                 console.log('getAssetSearchPromise(): res = ', res);

                if (typeof (res.data.response === 'undefined')) {
                    // console.log('HERE DATA', res.data);
                }
                if (!res.data.response) {
                    return;
                }
                const data = {
                    numFound: res.data.response.numFound,
                    docs: _.map(res.data.response.docs, (x) => {
                        return cleanAssetData(x);
                    }),
                    facets: res.data.facets,
                };

                setCache(request, data);
                resolve(data);
            })
            .catch((reason) => {
                console.log(
                    'getAssetSearchPromise(): OUCH axios call failed!',
                    reason
                );
                reject(reason);
            })
            .finally(() => {
                // performance.mark('getAssetSearchPromise:done');
                // performance.measure(
                //     'getAssetSearchPromise',
                //     'getAssetSearchPromise:start',
                //     'getAssetSearchPromise:done'
                // );
                // //                 console.log('performance:',performance.getEntriesByName('getAssetSearchPromise'));
                //
                // const perf = performance.getEntriesByName(
                //     'getAssetSearchPromise'
                // );
                // perf.forEach((x) => {
                //     console.log(
                //         'getAssetSearchPromise() duration:' + x.duration
                //     );
                // });
                // //console.log("performance getEntries:", performance.getEntries());
                // performance.clearMeasures();
            });
    });

    const promise = new Promise((resolve, reject) => {
        searchPromise
            .then((data) => {
                resolve(narrowData(data, query.facetFilters));
            })
            .catch((rej) => {
                console.log('Promise rejected: ', rej);
                reject(rej);
            });
    });
    return promise;
}

export function getAssetDataPromise(kmapid) {
    const host = 'ss251856-us-east-1-aws.measuredsearch.com';
    const index = 'kmassets_dev';
    const selectUrl = 'https://' + host + '/solr/' + index + '/select';
    const startRec = 0;
    const rowsRec = 1;

    const request = {
        adapter: jsonpAdapter,
        callbackParamName: 'json.wrf',
        url: selectUrl,
        params: {
            fl: '*',
            wt: 'json',
            echoParams: 'explicit',
            indent: 'true',
            start: startRec,
            rows: rowsRec,
            // eslint-disable-next-line
            q: 'uid:${kmapid}',
            kmapid: kmapid,
        },
    };

    const promise = new Promise((resolve, reject) => {
        let data = getCached(request);
        if (data) {
            resolve(data);
            return;
        }

        //console.log("getAssetDataPromise(): Calling axios:");
        axios
            .request(request)
            .then((res) => {
                //console.log("getAssetDataPromise():  Yay! axios call succeeded!", res);
                const data = res.data.response.docs[0];
                setCache(request, data);
                resolve(data);
            })
            .catch((reason) => {
                //console.log("gertAssetDataPromise(): OUCH axios call failed!", reason);
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

    // console.log( "getFullKmapDataPromise: kmapid = ", kmapid );

    const request = {
        adapter: jsonpAdapter,
        callbackParamName: 'json.wrf',
        url: selectUrl,
        params: {
            fl: '*,[child parentFilter=block_type:parent limit=1000]',
            wt: 'json',
            echoParams: 'explicit',
            indent: 'true',
            start: startRec,
            rows: rowsRec,
            // eslint-disable-next-line
            q: 'uid:${kmapid}',
            kmapid: kmapid,
        },
    };

    const promise = new Promise((resolve, reject) => {
        let data = getCached(request);
        if (data) {
            resolve(data);
            return;
        }
        //console.log("getFullKmapDataPromise(): Calling axios:")
        axios
            .request(request)
            .then((res) => {
                //console.log("getFullKmapDataPromise(): Yay! axios call succeeded!", res);
                const data = cleanKmapData(res.data.response.docs[0]);
                setCache(request, data);
                resolve(data);
            })
            .catch((reason) => {
                //console.log("getFullKmapDataPromise(): OUCH axios call failed!", reason);
                reject(reason);
            });
    });
    return promise;
}

function deriveImageUrl(url_thumb, size) {
    //console.log("deriveImageUrl: ", url_thumb);
    const url_large = url_thumb
        .toString()
        .replace('200,200', size + ',' + size);
    //console.log("deriveImageUrl: large = ", url_large);
    return url_large;
}

function cleanKmapData(data) {
    //console.log("clean kmap data = ", data);

    return data;
}

export function getRelatedAssetsPromise(kmapid, type, start, rows) {
    //console.log("getRelatedAssetsPromise() Promising: ", arguments);
    const host = 'ss251856-us-east-1-aws.measuredsearch.com';
    const index = 'kmassets_dev';
    const selectUrl = 'https://' + host + '/solr/' + index + '/select';
    const defaultStart = 0;
    const defaultRows = 100;

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

    const asset_types =
        typeof type === 'undefined' || type === null || type === 'all'
            ? ALL
            : [type];
    const startRec = typeof start === 'undefined' ? defaultStart : start;
    const rowsRec = typeof rows === 'undefined' ? defaultRows : rows;

    // console.log(
    //     'getRelatedAssetsPromise: asset_types = ' +
    //         asset_types +
    //         ' start = ' +
    //         startRec +
    //         ' rows = ' +
    //         rowsRec
    // );

    const facetJson = JSON.stringify({
        asset_counts: {
            limit: 20,
            type: 'terms',
            field: 'asset_type',
            domain: { excludeTags: 'ast' },
        },
    });

    let params = {
        fl: '*',
        wt: 'json',
        echoParams: 'explicit',
        indent: 'true',
        start: startRec,
        rows: rowsRec,
        'json.facet': facetJson,
        // eslint-disable-next-line
        q: '(uid:${kmapid}^100+kmapid:${kmapid})',
        kmapid: kmapid,
        fq: '{!tag=ast}asset_type:( ' + asset_types.join(' ') + ')',
    };

    const request = {
        adapter: jsonpAdapter,
        callbackParamName: 'json.wrf',
        url: selectUrl,
        params: params,
    };

    const unpackResponse = (res) => {
        // console.log('unpacking asset_counts: ', res.data.facets);

        const buckets = res.data.facets.asset_counts.buckets;

        let asset_counts = {
            all: { count: 0, docs: res.data.response.docs },
        };
        buckets.forEach((x) => {
            asset_counts[x.val] = { count: x.count, docs: [] };
            asset_counts['all'].count += x.count;
        });

        //console.log("unpacking assets: ", res.data.response.docs);
        const docs = res.data.response.docs;

        docs.forEach((x) => {
            const y = cleanAssetData(x);
            asset_counts[x.asset_type].docs.push(y);
        });

        return {
            uid: kmapid,
            start: start,
            rows: rows,
            type: type,
            stateKey: [kmapid, type, start, rows].join('/'),
            assets: asset_counts,
        };
    };

    const promise = new Promise((resolve, reject) => {
        // let data = getCached(request);
        // if (data) {
        //     resolve(data);
        //     return;
        // }
        //console.log("getRelatedAssetsPromise(): Calling axios:")
        axios
            .request(request)
            .then((res) => {
                // console.log(
                //     'getRelatedAssetsPromise():  Yay! axios call succeeded!',
                //     res
                // );
                const data = unpackResponse(res);
                setCache(request, data);
                resolve(data);
            })
            .catch((reason) => {
                console.log(
                    'getRelatedAssetsPromise(): OUCH axios call failed!',
                    reason
                );
                reject(reason);
            });
    });
    return promise;
}

function cleanAssetData(data) {
    // TODO: refactor this grunginess

    const asset_type = data.asset_type;

    //console.log("cleanAssetData ", asset_type);

    switch (asset_type) {
        case 'texts':
        case 'sources':
        case 'subjects':
        case 'places':
        case 'terms':
        case 'collections':
            data.url_large = '/mandala-om/gradient.jpg';
            data.url_thumb = '/mandala-om/gradient.jpg';
            data.url_thumb_height = 100.0;
            data.url_thumb_width = 150.0;
            break;
        case 'images':
            data.url_large = deriveImageUrl(data.url_thumb, 1200);
            break;
        default:
            break;
    }

    //console.log("clean thumb = ", data.url_thumb);
    //console.log("returning clean: ", data);
    return data;
}

// TODO: Refactor: parameterize basic_req to select which fields to search.
function constructTextQuery(searchString) {
    let searchstring = escapeSearchString(searchString || '');

    // console.log (JSON.stringify(state));
    let starts = searchstring.length ? searchstring + '*' : '*';
    let search = searchstring.length ? '*' + searchstring + '*' : '*';
    let slashy = searchstring + '/';
    if (!searchString || searchstring.length === 0) {
        searchstring = search = slashy = '*';
    }

    var basic_req = {
        // search: tweak for scoping later
        q:
            '(' +
            ' title:${xact}^100' +
            ' title:${slashy}^100' +
            // " title:${search}^10" +
            ' title:${starts}^80' +
            ' names_txt:${xact}^90' +
            ' names_txt:${starts}^70' +
            // " names_txt:${search}" +
            // " caption:${search}" +
            // " summary:${search}" +
            ')',

        // search strings
        xact: searchstring,
        starts: starts,
        search: search,
        slashy: slashy,
    };

    return basic_req;
}

function constructFilters(filters) {
    function arrayToHash(array, keyField) {
        console.log('received: ', array);
        if (!array) {
            array = [];
        }
        return array.reduce((collector, item) => {
            const key = item[keyField] || 'unknown key';
            if (!collector[key]) {
                collector[key] = [];
            }
            collector[key].push(item);
            return collector;
        }, {});
    }

    console.log('constructFilters: received filters: ', filters);
    const hashedFilters = arrayToHash(filters, 'field');
    console.log('constructFilters: sorted filters = ', hashedFilters);

    const facets = Object.keys(hashedFilters);
    // console.log('constructFilters: keys = ', facets);

    let fq_list = [];

    function constructFQs(facetData, fieldName) {
        let fq_list = [];
        let not_list = [];
        let and_list = [];
        let or_list = [];

        facetData.forEach((f) => {
            if (f.operator === 'NOT') {
                not_list.push(f.match);
            } else if (f.operator === 'AND') {
                and_list.push(f.match);
            } else {
                /* OR default case */
                or_list.push('"' + f.match + '"');
            }
        });

        const or_clause =
            '{!tag=' +
            fieldName +
            '}' +
            fieldName +
            ':' +
            '(' +
            or_list.join(' ') +
            ')';

        // TODO: does the order matter?
        if (or_list.length) fq_list.push(or_clause);
        if (and_list.length) fq_list.push(...and_list);
        if (not_list.length) fq_list.push(...not_list);

        // console.log('constructFQs returning: ', fq_list);
        return fq_list;
    }

    // TODO: Refactor so that facets can be added via configuration.
    facets.forEach((facet) => {
        const facetData = hashedFilters[facet];
        let fqs = [];
        // console.log('constructFilters:\tfacet ' + facet + ' = ', facetData);
        switch (facet) {
            case 'asset_type':
                fqs = constructFQs(facetData, 'asset_type');
                fq_list.push(...fqs);
                break;
            case 'subjects':
                fqs = constructFQs(facetData, 'kmapid');
                fq_list.push(...fqs);
                break;
            case 'places':
                fqs = constructFQs(facetData, 'kmapid');
                fq_list.push(...fqs);
                break;
            case 'terms':
                fqs = constructFQs(facetData, 'kmapid');
                fq_list.push(...fqs);
                break;
            case 'languages':
                fqs = constructFQs(facetData, 'language');
                fq_list.push(...fqs);
                break;
            case 'feature_types':
                fqs = constructFQs(facetData, 'kmapid');
                fq_list.push(...fqs);
                break;
            case 'users':
                fqs = constructFQs(facetData, 'node_user_full_s');
                fq_list.push(...fqs);
                break;
            case 'creator':
                fqs = constructFQs(facetData, 'creator');
                fq_list.push(...fqs);
                break;
            case 'collections':
                fqs = constructFQs(facetData, 'collection_uid_s');
                fq_list.push(...fqs);
                break;
            case 'perspective':
                fqs = constructFQs(facetData, 'perspectives_ss');
                fq_list.push(...fqs);
                break;
            case 'associated_subjects':
                fqs = constructFQs(facetData, 'associated_subject_map_idfacet');
                fq_list.push(...fqs);
                break;
            default:
                console.error('UNHANDLED FACET TYPE: ' + facet);
                break;
        }
    });

    // console.log('RETURNING FQ_LIST = ', fq_list);
    return { fq: fq_list };
}

function escapeSearchString(str) {
    str = str.replace(/ /g, '\\ '); // escape spaces
    str = str.replace('(', '\\(');
    str = str.replace(')', '\\)');
    str = str.replace(':', '\\:');
    str = str.replace('+', '\\+');
    str = str.replace('-', '\\-');
    str = str.replace('"', '\\"');
    str = str.replace('?', '\\?');
    return str;
}
