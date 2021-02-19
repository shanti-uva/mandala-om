import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
/**
 * A function to get the proper Solr base URL for the current environment.
 * Returns an object with both an assets and a terms property that contains the base url to that index
 * for the given environment. Uses environment variables set by .env files for each environment
 * @returns {{assets: string, terms: string}}
 */
export function getSolrUrls() {
    return {
        assets: process.env.REACT_APP_SOLR_KMASSETS + '/select',
        terms: process.env.REACT_APP_SOLR_KMTERMS + '/select',
    };
}

function unPackRelatedData(res, kmapid, type, start, rows) {
    // console.log('unpacking asset_counts: ', res.data.facets);
    if (res == null) {
        return {};
    }

    const buckets = res.facets.asset_counts.buckets;

    let asset_counts = {
        all: { count: 0, docs: res.response.docs },
    };
    buckets.forEach((x) => {
        asset_counts[x.val] = { count: x.count, docs: [] };
        asset_counts['all'].count += x.count;
    });

    //console.log("unpacking assets: ", res.data.response.docs);
    const docs = res.response.docs;

    docs.forEach((x) => {
        const y = cleanAssetData(x);
        asset_counts[x.asset_type].docs.push(y);
    });

    //Add a hasMore boolean which checks if there is more data to fetch
    const hasMore =
        asset_counts[type]?.count <= start * rows + rows ? false : true;

    return {
        uid: kmapid,
        start: start,
        rows: rows,
        type: type,
        stateKey: [kmapid, type, start, rows].join('/'),
        hasMore,
        assets: asset_counts,
    };
}

export const useUnPackedMemoized = (res, kmapid, type, start, rows) => {
    return useMemo(() => unPackRelatedData(res, kmapid, type, start, rows), [
        res,
        kmapid,
        type,
        start,
        rows,
    ]);
};

function cleanAssetData(data) {
    // TODO: refactor this grunginess

    const asset_type = data.asset_type;

    // Set the image path to account for standalone apps
    const img_path =
        process.env.REACT_APP_STANDALONE === 'standalone'
            ? '/wp-content/uploads/gradient.jpg'
            : '/mandala-om/img/gradient.jpg';

    //console.log("cleanAssetData ", asset_type);

    switch (asset_type) {
        case 'texts':
        case 'sources':
        case 'subjects':
        case 'places':
        case 'terms':
        case 'collections':
            data.url_large = img_path;
            data.url_thumb = img_path;
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

function deriveImageUrl(url_thumb, size) {
    //console.log("deriveImageUrl: ", url_thumb);
    const url_large = url_thumb
        .toString()
        .replace('200,200', size + ',' + size);
    //console.log("deriveImageUrl: large = ", url_large);
    return url_large;
}

/**
A custom hook that builds on useLocation to parse the query string. */
export function useQuery() {
    return new URLSearchParams(useLocation().search);
}
