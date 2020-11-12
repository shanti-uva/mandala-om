import { useSolr } from './useSolr';
const QUERY_BASE = 'kmassets';

/**
 * useAsset is a hook to load asset records from kmassets index.
 * It has two params: asset_type and nid. The former is "images", "audio-video", etc.
 * The nid parameter can be either an integer node id or the word "all" to return all records for that asset type.
 *
 * @param asset_type
 * @param nid
 * @returns {*}
 */
const useAsset = (asset_type, nid) => {
    const idfilter = nid !== 'all' ? ` AND id:${nid}` : ''; // TODO: check that id is a number if not "all" ?
    const querySpecs = {
        index: 'assets',
        params: {
            q: `asset_type:${asset_type}${idfilter}`,
            rows: 1,
        },
    };
    const query_key = QUERY_BASE + '-' + asset_type + '-' + nid;

    const resource = useSolr(query_key, querySpecs);
    return resource;
};

export default useAsset;
