import KmapsSolrUtil from '../legacy/kmapsSolrUtil';

export default async function search (searchstate) {
    // TODO:  need to pass configuration.   Otherwise dev defaults are used.
    const ksolr = new KmapsSolrUtil();

    function adaptState(searchstate) {
        // adjust state if necessary
        const adaptedState = searchstate.map( x => x );
        return adaptedState;
    }

    const adaptedState = adaptState(searchstate);
    const solrQueryUrl = ksolr.createBasicQuery(adaptedState);

    await fetch(solrQueryUrl)
        .then(res => (res.ok ? res : Promise.reject(res)))
        .then(res => res.json())
}