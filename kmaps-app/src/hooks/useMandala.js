import { useQuery } from 'react-query';
import jsonpAdapter from '../logic/axios-jsonp';
import axios from 'axios';

const QUERY_KEY = 'mndlapi';

/**
 * Function to do an Axios request for a JSON API using jsonp.
 *
 * @param _
 * @param query
 * @returns {Promise<boolean|*>}
 */
const getMandalaAPI = async (query) => {
    if (query === '') {
        return false;
    }
    const request = {
        adapter: jsonpAdapter,
        callbackParamName: 'callback',
        url: query,
    };

    const { data } = await axios.request(request);
    //console.log("isloading", isLoading);
    const retdata = data && data.response ? data.response : data;
    return retdata;
};

/**
 * UseMandala is a hook to call Mandala node data apis in JSON.
 * It takes a solr object returned by the useAsset() hook which queries SOLR for a single asset's record.
 * It uses the useQuery enabled setting to wait for useAsset to return the JSON object from the SOLR qurey.
 * It takes the url_json field from that solr record and uses that to call the API.
 * In AV, the API call ends with `.json`. So it replaces this with `.jsonp?callback=mdldata`.
 * And with that and the useQuery() hook calls the getMandalaAPI() function above.
 * The axios jsonp request assumes the callback parameter name in the url is `callback`.
 *
 * Than Grove, Aug. 26, 2020
 *
 * @param solrobj
 * @returns {unknown}
 */
const useMandala = (solrobj) => {
    const obj = solrobj?.docs[0];
    const json_url = obj.url_json;

    return useQuery(
        [QUERY_KEY, obj.id, obj.asset_type],
        () => getMandalaAPI(json_url),
        {
            enabled: !!obj.id,
        }
    );
    // if (solrobj) {
    //     if (solrobj.url_json) {
    //         json_url = solrobj.url_json;
    //     } else if (solrobj.docs && solrobj.docs.length > 0) {
    //         json_url = solrobj.docs[0].url_json;
    //     }
    // }
};

export default useMandala;
