import axios from 'axios';
import jsonpAdapter from './axios-jsonp';
import crypto from 'crypto';
import _ from 'lodash';
import Qs from 'qs';

function checksum(data) {
    return crypto.createHash('sha1').update(data).digest('base64');
}

// TODO: There needs to be better/smarter caching.  sessionStorage is too small to be unmanaged like this.
export async function search(searchstate) {
    return await getAssetSearchPromise(searchstate);

    // TODO:  need to pass configuration.   dev defaults are used now.
}

//  TODO: Maybe refactor to use declarative caching instead...?
function getCached(request) {
    let data = null;
    // TODO: Need explicit cache controls and timeouts, etc.
    if (sessionStorage) {
        try {
            const cached = sessionStorage.getItem(
                checksum(JSON.stringify(request))
            );
            if (cached) {
                data = JSON.parse(cached);
            }
        } catch (e) {
            console.log('Ignored sessionStorage error: ', e);
        }
    }
    //console.log("getCached: returning: ", data);
    return data;
}

function setCache(request, data) {
    if (sessionStorage) {
        try {
            sessionStorage.setItem(
                checksum(JSON.stringify(request)),
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

export function getAssetSearchPromise(search) {
    // TODO: parameterize the use of facets
    // TODO: parameterize constructTextQuery

    //console.log("UNPACKING search: ", search);
    const { page, query } = search;

    //console.log("UNPACKING page: ", page);
    //console.log("UNPACKING query: ", query);

    const host = 'ss251856-us-east-1-aws.measuredsearch.com';
    const index = 'kmassets_dev';
    const selectUrl = 'https://' + host + '/solr/' + index + '/select';
    const startRec = page.start || 0;
    const rowsRec = page.rows || 10;

    const qaxios = axios.create({
        paramsSerializer: (params) =>
            Qs.stringify(params, { arrayFormat: 'repeat' }),
    });

    // TODO: Parameterize facets.  e.g. You won't need all of them, every time.
    const jsonFacet = {
        asset_count: {
            type: 'terms',
            field: 'asset_type',
            limit: 500,
            domain: { excludeTags: 'asset_type' },
        },
        related_subjects: {
            type: 'terms',
            field: 'kmapid_subjects_idfacet',
            limit: 2000,
        },
        related_places: {
            type: 'terms',
            field: 'kmapid_places_idfacet',
            limit: 2000,
        },
        related_terms: {
            type: 'terms',
            field: 'kmapid_terms_idfacet',
            limit: 2000,
        },
        feature_types: {
            limit: 300,
            type: 'terms',
            field: 'feature_types_idfacet',
        },
        languages: {
            limit: 300,
            type: 'terms',
            field: 'node_lang',
        },
        collections: {
            limit: 300,
            type: 'terms',
            field: 'collection_idfacet',
        },

        collection_nid: {
            limit: 300,
            type: 'terms',
            field: 'collection_nid',
        },
        collection_uid: {
            limit: 300,
            type: 'terms',
            field: 'collection_uid_s',
        },
        asset_subtype: {
            limit: 300,
            type: 'terms',
            field: 'asset_subtype',
            facet: {
                parent_type: {
                    limit: 1,
                    type: 'terms',
                    field: 'asset_type',
                },
            },
        },
        node_user: {
            limit: 300,
            type: 'terms',
            field: 'node_user_full_s',
        },
        creator: {
            limit: 300,
            type: 'terms',
            field: 'creator',
        },
    };

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

    const promise = new Promise((resolve, reject) => {
        let data = getCached(request);
        if (data) {
            resolve(data);
            return;
        }

        console.log('getAssetSearchPromise(): Calling axios:', request);

        performance.mark('getAssetSearchPromise:start');
        qaxios
            .request(request)
            .then((res) => {
                //                 console.log(
                //                     'getAssetSearchPromise():  Yay! axios call succeeded!',
                //                     res
                //                 );
                //                 console.log('getAssetSearchPromise(): res = ', res);
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
                performance.mark('getAssetSearchPromise:done');
                performance.measure(
                    'getAssetSearchPromise',
                    'getAssetSearchPromise:start',
                    'getAssetSearchPromise:done'
                );
                //                 console.log(
                //                     'performance:',
                //                     performance.getEntriesByName('getAssetSearchPromise')
                //                 );

                const perf = performance.getEntriesByName(
                    'getAssetSearchPromise'
                );
                perf.forEach((x) => {
                    console.log(
                        'getAssetSearchPromise() duration:' + x.duration
                    );
                });
                //console.log("performance getEntries:", performance.getEntries());
                performance.clearMeasures();
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
        typeof type === 'undefined' || type === 'all' ? ALL : [type];
    const startRec = typeof start === 'undefined' ? defaultStart : start;
    const rowsRec = typeof rows === 'undefined' ? defaultRows : rows;

    //console.log("getRelatedAssetsPromise: start = " + startRec + " rows = " + rowsRec);

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
        //console.log("unpacking asset_counts: ", res.data.facets);

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
        let data = getCached(request);
        if (data) {
            resolve(data);
            return;
        }
        //console.log("getRelatedAssetsPromise(): Calling axios:")
        axios
            .request(request)
            .then((res) => {
                //console.log("getRelatedAssetsPromise():  Yay! axios call succeeded!", res);
                const data = unpackResponse(res);
                setCache(request, data);
                resolve(data);
            })
            .catch((reason) => {
                //console.log("getRelatedAssetsPromise(): OUCH axios call failed!", reason);
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
        return array.reduce((collector, item) => {
            const key = item[keyField] || 'unknown key';
            if (!collector[key]) {
                collector[key] = [];
            }
            collector[key].push(item);
            return collector;
        }, {});
    }

    // console.log("constructFilters: received filters: ", filters);
    const sortedFilters = arrayToHash(filters, 'field');
    console.log('constructFilters: sorted filters = ', sortedFilters);

    const facets = Object.keys(sortedFilters);
    console.log('constructFilters: keys = ', facets);

    let fq_list = [];

    function constructFQs(facetData, fieldName) {
        let fq_list = [];
        let not_list = [];
        let and_list = [];
        let or_list = [];
        // console.log("handle asset_type");
        // console.log("   facet = ", facet);
        // console.log("   facet data = ", facetData);

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
            ':(' +
            or_list.join(' ') +
            ')';
        fq_list.push(or_clause);

        return fq_list;
    }

    facets.forEach((facet) => {
        const facetData = sortedFilters[facet];
        let fqs = [];
        console.log('constructFilters:\tfacet ' + facet + ' = ', facetData);
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
                fqs = constructFQs(facetData, 'kmapid');
                break;
            case 'users':
                console.log('handle users');
                console.log('   facet = ', facet);

                break;
            case 'creators':
                console.log('handle creators');
                console.log('   facet = ', facet);
                break;
            case 'collections':
                console.log('handle collections');
                console.log('   facet = ', facet);

                break;
            default:
                console.log('handle default');
                console.log('   facet = ', facet);
                break;
        }
    });

    console.log('RETURNING FQ_LIST = ', fq_list);
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
