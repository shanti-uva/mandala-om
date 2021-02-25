import { useQuery } from 'react-query';
import axios from 'axios';
import slugify from 'slugify';
import _ from 'lodash';
import jsonpAdapter from '../logic/axios-jsonp';
import { getSolrUrls } from './utils';

const solr_urls = getSolrUrls();

export function useSearch(searchText = '', start, rows) {
    return useQuery(
        ['search', start, rows, slugify(searchText)],
        () => getSearchData(searchText, start, rows),
        { keepPreviousData: true }
    );
}

async function getSearchData(searchText, start, rows) {
    let params = {
        fl: '*',
        wt: 'json',
        echoParams: 'explicit',
        indent: 'true',
        start: start,
        rows: rows,
        'json.facet': JSON.stringify(getJsonFacet()),
    };
    const queryParams = constructTextQuery(searchText);
    const filterParams = constructFilters([]); // TODO: gk3k -> Need to implement filters.

    params = { ...params, ...queryParams, ...filterParams };

    const request = {
        adapter: jsonpAdapter,
        callbackParamName: 'json.wrf',
        url: solr_urls.assets,
        params: params,
    };

    const { data } = await axios.request(request);

    return data;
}

function getJsonFacet() {
    return {
        asset_count: {
            type: 'terms',
            field: 'asset_type',
            limit: 0,
            offset: 0,
            //sort: ff['asset_type']?.sort || 'count desc',
            domain: { excludeTags: 'asset_type' },
            numBuckets: true,
        },
        related_subjects: {
            type: 'terms',
            field: 'kmapid_subjects_idfacet',
            limit: 0,
            offset: 0,
            //sort: ff['subjects']?.sort || 'count desc',
            numBuckets: true,
        },
        related_places: {
            type: 'terms',
            field: 'kmapid_places_idfacet',
            limit: 0,
            offset: 0,
            //sort: ff['places']?.sort || 'count desc',
            numBuckets: true,
        },
        related_terms: {
            type: 'terms',
            field: 'kmapid_terms_idfacet',
            limit: 0,
            offset: 0,
            //sort: ff['terms']?.sort || 'count desc',
            numBuckets: true,
        },
        feature_types: {
            type: 'terms',
            field: 'feature_types_idfacet',
            limit: 0,
            offset: 0,
            //sort: ff['feature_types']?.sort || 'count desc',
            numBuckets: true,
        },
        languages: {
            type: 'terms',
            field: 'node_lang',
            limit: 0,
            offset: 0,
            //sort: ff['languages']?.sort || 'count desc',
            numBuckets: true,
        },
        collections: {
            type: 'terms',
            field: 'collection_idfacet',
            limit: 0,
            offset: 0,
            //sort: ff['collections']?.sort || 'count desc',
            numBuckets: true,
        },

        node_user: {
            type: 'terms',
            field: 'node_user_full_s',
            limit: 0,
            offset: 0,
            //sort: ff['user']?.sort || 'count desc',
            numBuckets: true,
        },
        creator: {
            type: 'terms',
            field: 'creator',
            limit: 0,
            offset: 0,
            //sort: ff['creator']?.sort || 'count desc',
            numBuckets: true,
        },
        perspective: {
            type: 'terms',
            field: 'perspectives_ss',
            limit: 0,
            offset: 0,
            //sort: ff['perspective']?.sort || 'count desc',
            numBuckets: true,
        },
        associated_subjects: {
            type: 'terms',
            field: 'associated_subject_map_idfacet',
            limit: 0,
            offset: 0,
            //sort: ff['associated_subjects']?.sort || 'count desc',
            numBuckets: true,
        },
    };
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
        q: '*:*',
        // search strings
        xact: searchstring,
        starts: starts,
        search: search,
        slashy: slashy,
    };

    return basic_req;
}

function constructFilters(filters) {
    // If no filters are passed then we return the all the assets.
    if (_.isEmpty(filters)) {
        return {
            fq:
                'asset_type:(audio-video images texts visuals sources subjects places terms)',
        };
    }

    // console.log('constructFilters: received filters: ', filters);
    const hashedFilters = arrayToHash(filters, 'field');
    // console.log('constructFilters: sorted filters = ', hashedFilters);

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
                not_list.push(
                    '(*:* AND -' + fieldName + ':("' + f.match + '"))'
                );
            } else if (f.operator === 'AND') {
                and_list.push(
                    '(*:* AND ' + fieldName + ':("' + f.match + '"))'
                );
            } else {
                /* OR default case */
                or_list.push('(*:* OR ' + fieldName + ':("' + f.match + '"))');
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

function arrayToHash(array, keyField) {
    // console.log('received: ', array);
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
