import { useSolr } from './useSolr';
const QUERY_BASE = 'kmassets';

const useCollection = (asset_type, nid) => {
    const querySpecs = {
        index: 'assets',
        params: {
            q: `id:${nid}`,
            fq: ['asset_type:collections', `asset_subtype:${asset_type}`],
            rows: 1,
        },
    };
    // console.log(querySpecs)
    const query_key = QUERY_BASE + '-' + asset_type + '-' + nid;

    const resource = useSolr(query_key, querySpecs);
    // console.log('useAsset: querySpecs = ', querySpecs);
    // console.log('useAsset: returning resource = ', resource);
    return resource?.docs && resource.docs.length > 0
        ? resource.docs[0]
        : resource;
};

export default useCollection;
