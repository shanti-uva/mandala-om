/*
Kmaps Solr Util to encaspulate solr query assembly logic

Usage:

        var util = new KmapsSolrUtil();
        var url = util.createBasicQuery(state);

    createBasicQuery(state) uses a populated "state" object and returns the appropriate url as a String.

 */
/* eslint-disable */

import $ from 'jquery';


const DEBUG = false;

export default class KmapsSolrUtil {

    constructor(overrideDefaultState) {
        // // check to make sure that jQuery is available
        // if (typeof $ !== "function")
        //     $ = jQuery;

        if (typeof $ === "undefined") {
            throw("This libraries requires jQuery");
        }

        // this is the default state, state that is passed in overrides these values
        this.defaultState = {
            "solrUrl": "https://solrUrl.must.be.set.in.the.state.object",
            "mode": "input",
            "view": "Card",
            "sort": "Alpha",
            "type": "All",
            "page": 0,																			// Current page being shown
            "pageSize": 100,																	// Results per page
            "query": { 																		// Current query
                "text": "",																			// Search word
                "places": [],																			// Places
                "collections": [],																		// Collections
                "languages": [],																		// Languages
                "features": [],																			// Feature types
                "subjects": [],																			// Subjects
                "terms": [],																			// Terms
                "relationships": [],																	// Relationships
                "users": [],																			// Users
                "assets": [],																			// Assets
                "dateStart": "",
                "dateEnd": "",															// Beginning and ending dates
                "project_filter": ""
            }
        };

        // override the defaultState with state that was passed in the constructor
        if (overrideDefaultState) {
            this.defaultState = $.extend(true, {}, this.defaultState, overrideDefaultState);
        }


        // facet configs.

        // This probably should be a config element.
        this.facetJSON = {
            "asset_counts": {
                "limit": 100,
                "type": "terms",
                "field": "asset_type",
                "domain": {"excludeTags": "ast"}
            },

            "places": {
                "limit": 300,
                "type": "terms",
                "field": "kmapid_places_idfacet"
            },
            "subjects": {
                "limit": 300,
                "type": "terms",
                "field": "kmapid_subjects_idfacet"
            },
            "terms": {
                "limit": 300,
                "type": "terms",
                "field": "kmapid_terms_idfacet"
            },
            "features": {
                "limit": 300,
                "type": "terms",
                "field": "feature_types_idfacet"
            },
            "languages": {
                "limit": 300,
                "type": "terms",
                "field": "node_lang"
            },
            "collections": {
                "limit": 300,
                "type": "terms",
                "field": "collection_idfacet"
            },

            // "subjects": {
            //     "limit": 300,
            //     "type": "terms",
            //     "field": "kmapid",
            //     "prefix": "subjects",
            //     "facet": {
            //         "title": {
            //             "limit":1,
            //             "type":"terms",
            //             "field":"title"
            //         }
            //     }
            // },
            "collection_nid": {
                "limit": 300,
                "type": "terms",
                "field": "collection_nid"
            },
            "collection_uid": {
                "limit": 300,
                "type": "terms",
                "field": "collection_uid_s"
            },
            "asset_subtype": {
                "limit": 300,
                "type": "terms",
                "field": "asset_subtype",
                "facet": {
                    "parent_type": {
                        "limit": 1,
                        "type": "terms",
                        "field": "asset_type"
                    }
                }
            },
            "node_user": {
                "limit": 300,
                "type": "terms",
                "field": "user_name_full_s"
            },
            "creator": {
                "limit": 300,
                "type": "terms",
                "field": "creator"
            }
            // "feature_types_ss": {
            //     "limit": 300,
            //     "type": "terms",
            //     "field": "feature_types_ss"
            // },

            // "node_lang": {
            //     "limit": 300,
            //     "type": "terms",
            //     "field": "node_lang"
            // },
            // "schema_version": {
            //     "limit": -1,
            //     "type": "terms",
            //     "field": "schema_version_i"
            // }
        };


        this.facetAdvancedJSON = {
            related: {
                domain: {blockChildren: "block_type:parent"},
                type: "terms",
                field: "related_subjects_relation_code_s",
                limit: -1,
                facet: {
                    related_subject: {
                        type: "terms",
                        field: "related_subjects_id_s",
                        limit: -1,
                        facet: {
                            related_subject_name: {
                                type: "terms",
                                field: "related_subjects_header_s",
                                limit: 1
                            }
                        }
                    }
                }
            }
        };
    }

    allAssets() {
        return [
            {id: "audio-video", title: "audio-video", bool: "OR"},
            {id: "images", title: "images", bool: "OR"},
            {id: "texts", title: "images", bool: "OR"},
            {id: "visuals", title: "visuals", bool: "OR"},
            {id: "sources", title: "sources", bool: "OR"},
            {id: "subjects", title: "subjects", bool: "OR"},
            {id: "places", title: "places", bool: "OR"},
            {id: "terms", title: "terms", bool: "OR"}
        ];
    }

    createBasicQuery(state, selected_facets, filter_facet) {

        const ALL_ASSETS = this.allAssets();

        state = $.extend(true, {}, this.defaultState, state);

        // process selected facets.
        var currentFacets = {};

        // selected facets
        if (selected_facets && selected_facets.length > 0) {
            for (var n = 0; n < selected_facets.length; n++) {
                var sf = selected_facets[n];
                var fac = this.facetJSON[sf];
                if (fac) {
                    currentFacets[sf] = fac;
                } else {
                    console.error("Warning: ignoring unknown facet: " + sf);
                }
            }
        }

        if ($.isEmptyObject(currentFacets)) {
            console.log("no currentFacets so using ALL facets");
            currentFacets = this.facetJSON;
        }

        var facet_fqs = [];
        // argument form [ facetname:filterstring ]
        if (filter_facet) {
            if (filter_facet.length > 0) {
                for (var m = 0; m < filter_facet.length; m++) {
                    var split = filter_facet[m].split(':');
                    var facet_name = split[0];
                    var facet_filter = split[1];
                    // console.dir({ "facet_name": facet_name, "facet_filter": facet_filter });

                    var facet_blob = this.facetJSON[facet_name];
                    // console.dir(facet_blob);

                    var field = facet_blob.field;

                    // console.log ("FIELD: "+ field);
                    var new_fq = field + ":*" + facet_filter + "*"
                    facet_fqs.push(new_fq);
                }
            }
        }

        function escapeSearchString(str) {
            str = str.replace(/ /g, '\\ '); // escape spaces
            str = str.replace('(', '\\(');
            str = str.replace(')', '\\)');
            str = str.replace(':', '\\:');
            str = str.replace('+', '\\+');
            str = str.replace('-', '\\-');
            str = str.replace('"', '\\\"');
            str = str.replace('?', '\\?');

            return str;
        }

        // create request object

        var searchstring = state.query.text || "";
        searchstring = escapeSearchString(searchstring);
        var page = state.page || 0;
        var pageSize = state.pageSize || 100;

        if (facet_fqs.length > 0) pageSize = 0;  // zero pagesize if this is a facet filtering situation

        // console.log (JSON.stringify(state));
        var starts = (searchstring.length) ? searchstring + "*" : "*";
        var search = (searchstring.length) ? "*" + searchstring + "*" : "*";
        var slashy = searchstring + "/";
        if ($.type(searchstring) === "undefined" || searchstring.length === 0) {
            searchstring = search = slashy = "*";
        }
        var start = page * pageSize;

        var fq_array = [];

        // places
        if (state.query.places && state.query.places.length) {
            fq_array.push(this.buildFq(state.query.places, "kmapid"));
        }

        // subjects
        if (state.query.subjects && state.query.subjects.length) {
            fq_array.push(this.buildFq(state.query.subjects, "kmapid"));
        }

        // terms
        if (state.query.terms && state.query.terms.length) {
            fq_array.push(this.buildFq(state.query.terms, "kmapid"));
        }

        // slices
        if (state.query.features && state.query.features.length) {

            // console.error("FEATURES!");
            // console.dir(state.query.slices);
            fq_array.push(this.buildFq(state.query.features, "feature_types_ss", "title"));
        }

        // collections
        if (state.query.collections && state.query.collections.length) {
            fq_array.push(this.buildFq(state.query.collections, "collection_uid_s", "id"));
        }

        // languages
        if (state.query.languages && state.query.languages.length) {
            fq_array.push(this.buildFq(state.query.languages, "node_lang", "title"));
            // console.error("LANGUAGES!");
            // console.dir(state.query.languages);
        }

        if (state.query.assets && state.query.assets.length) {

            // handle "all" id
            for (var i = 0; i < state.query.assets.length; i++) {

                // console.log("asset id = " + state.query.assets[i].id);
                if (state.query.assets[i].id === "all") {
                    state.query.assets = ALL_ASSETS;
                }
            }

            fq_array.push(this.buildFq(state.query.assets, "asset_type", "id", "ast"));
        }

        if (state.query.users && state.query.users.length) {


            if (DEBUG) {
                console.error("USERS!");
                console.dir(state.query.users);
            }

            fq_array.push(this.buildFq(state.query.users, "node_user", "title"));

        }

        if (state.query.creators && state.query.creators.length) {


            if (DEBUG) {
                console.error("CREATORS!");
                console.dir(state.query.creators);
            }

            fq_array.push(this.buildFq(state.query.creators, "creator", "title"));

        }

        // project filtering
        if (state.project_filter && state.project_filter.length) {
            fq_array.push(state.project_filter);
            if (DEBUG) { // debugging
                console.error("PROJECT_FILTER:");
                console.dir(state.project_filter);
                console.error("FQ:");
                console.dir(fq_array);
            }
        }

        var kmapid = "";
        if (state.query.kmapid) {
            kmapid = state.query.kmapid;
        }
        // console.log(JSON.stringify (fq_array, undefined, 2));

        var basic_req = {
            // search: tweak for scoping later
            "q": "(" +
                " title:${xact}^100" +
                " title:${slashy}^100" +
                " names_txt:${xact}^90" +
                " title:${starts}^80" +
                " names_txt:${starts}^70" +
                " title:${search}^10" +
                " caption:${search}" +
                " summary:${search}" +
                " names_txt:${search}" +
                ")",

            // search strings
            "xact": searchstring,
            "starts": starts,
            "search": search,
            "slashy": slashy,
        };

        var all_req = {
            "q": "*"
        };

        var kmapid_req = {
            "q": "(uid:${kmapid}^100 kmapid:${kmapid})",
            "kmapid": kmapid
        };

        if (searchstring === "*" || searchstring === "") {
            basic_req = all_req;
        }

        var reqbase = (kmapid.length) ? kmapid_req : basic_req;
        var req = $.extend(
            {},
            {
                // generic settings (maybe tweak for efficiency later)
                "fl": "*",
                "wt": "json",

                // paging
                "start": start,
                "rows": pageSize,

                // facets
                "facet": "on",
                "json.facet": JSON.stringify(currentFacets),

                /*
                // highlighting
                "hl": "on",
                "hl.method": "unified",
                "hl.fl": "title,caption,summary,names_txt",
                "hl.fragsize": 0,
                "hl.tag.pre": "<mark>",
                "hl.tag.post": "</mark>",
                */

                // debug settings  -- set both to false in production?
                "echoParams": "explicit",
                "indent": "true"
            },
            reqbase);

        var baseurl = state.solrUrl;
        var params = new URLSearchParams(req);

        // process the fq's

        for (var i = 0; i < fq_array.length; i++) {
            params.append("fq", fq_array[i]);
        }

        for (var p = 0; p < facet_fqs.length; p++) {
            params.append("fq", facet_fqs[p]);
        }

        var url = new URL(baseurl + "?" + params.toString());
        return url;
    }

    createKmapQuery(kmapid, atype, page, pageSize) {

        const ALL_ASSETS = this.allAssets();
        pageSize = (pageSize) ? pageSize : 10;
        page = (page) ? page : 0;
        var alist = (atype) ? [{id: atype, title: atype, bool: "OR"}] : ALL_ASSETS;
        return this.createBasicQuery(
            {
                page: page,
                pageSize: pageSize,
                query: {
                    kmapid: kmapid,
                    assets: alist
                }
            },
            ['asset_counts']
        );
    }

    createAssetsByCollectionQuery(collection_uid, page, pageSize) {
        return this.createBasicQuery(
            {
                page: page,
                pageSize: pageSize,
                query: {
                    collections: [{title: collection_uid, id: collection_uid, bool: "OR"}]
                }
            }
        );
    }

    buildFq(facets, facet_field, type, tag) {
        if (!type) {
            type = "id";
        }
        var bangtag = (tag) ? "{!tag=" + tag + "}" : "";
        // console.log("Got facet values: " + JSON.stringify(facets));
        var st = "";
        for (var i = 0; i < facets.length; i++) {
            var entry = facets[i];
            // console.log("Got facet: " + JSON.stringify(entry));
            var km = entry[type];
            var op = "";

            if (entry.bool === "AND") {
                op = "+";
            } else if (entry.bool === "NOT") {
                op = "-";
            } else if (entry.bool === "OR") {
                op = "";
            } else {
                console.error("Unknown operator = " + entry.bool + " : " + JSON.stringify(entry));
            }

            st += " " + op + "\"" + km + "\"";
        }

        var fq = bangtag + facet_field +
            ":(" + st + ")";
        // console.log("FQ: " + fq);
        return fq;
    }

    createAdvancedFacetQuery(state) {
        state = $.extend(true, {}, this.defaultState, state);

        state.solrUrl = "https://ss251856-us-east-1-aws.measuredsearch.com/solr/kmterms_dev/select"

        // create request object

        var searchstring = state.query.text || "";
        var page = state.page || 0;
        var pageSize = state.pageSize || 100;
        // console.log (JSON.stringify(state));
        var starts = searchstring + "*";
        var search = "*" + searchstring + "*";
        var slashy = searchstring + "/";
        if ($.type(searchstring) === "undefined" || searchstring.length === 0) {
            searchstring = search = slashy = "*";
        }

        var req =
            {
                // search: tweak for scoping later
                "q": "(" +
                    " header:${xact}^100" +
                    " header:${slashy}^100" +
                    // " names_txt:${xact}^90" +
                    " header:${starts}^80" +
                    // " names_txt:${starts}^70" +
                    " header:${search}^10" +
                    // " caption:${search}" +
                    // " summary:${search}" +
                    // " names_txt:${search}" +
                    ")",

                // search strings
                "xact": searchstring,
                "starts": starts,
                "search": search,
                "slashy": slashy,

                // generic settings (maybe tweak for efficiency later)
                "fl": "*,[child parentFilter=block_type:parent]",
                "wt": "json",

                // paging
                "start": page,
                "rows": pageSize,

                // facets
                "facet": "on",
                "json.facet": JSON.stringify(this.facetAdvancedJSON),

                // highlighting
                // "hl": "on",
                // "hl.method": "unified",
                // "hl.fl": "header,caption,summary,names_txt",
                // "hl.fragsize": 0,
                // "hl.tag.pre": "<mark>",
                // "hl.tag.post": "</mark>",

                // debug settings  -- set both to false in production?
                "echoParams": "explicit",
                "indent": "true"
            };

        var baseurl = state.solrUrl;
        var params = new URLSearchParams(req);
        var url = new URL(baseurl + "?" + params.toString());
        return url;
    }

    buildQuery(termIndexRoot, type, path, lvla, lvlb, fl) {
        var SOLR_ROW_LIMIT = 2000;
        path = path.replace(/^\//, "").replace(/\s\//, " ");  // remove root slashes
        if (path === "") {
            path = "*";
        }

        var levelField = "level_i";
        var ancestorField = "ancestor_id_path";
        if (type === "terms") {
            levelField = "level_tib.alpha_i";
            ancestorField = "ancestor_id_tib.alpha_path";
        }

        var jsonfacetblob = {
            "child_counts": {
                "limit": 300,
                "mincount": 2,
                "type": "terms",
                "field": ancestorField,
                "domain": {"excludeTags": "hoot"}
            }
        };

        // noinspection ConditionalExpressionJS
        var fieldList = (fl) ? fl : ([
            "header",
            "id",
            "ancestor*",
            "caption_eng",
            "position*",
            levelField
        ].join(","));

        var level_fqlist = [];

        for ( var lvl = lvlb + 1; lvl > lvla; lvl--) {
            var short_path = path.split("/").slice(0,lvl-1).join("/");
            // console.log("shorty: " + lvl +": " + JSON.stringify(short_path));
            let path_filter = (short_path.length)?" AND " + ancestorField + ":" + short_path: "";
            level_fqlist.push("(" + levelField + ":" + (lvl - 1) + path_filter +")");
        }
        const level_fqs = level_fqlist.join(" ");  // space separated list (OR)
        let top_path = path.split("/").slice(0,lvla).join("/");
        // console.dir(level_fqs);
        // console.log("top_path = " + top_path)

        var req_url =
            termIndexRoot + "/select?" +
            "df=" + ancestorField +
            "&q=" + top_path +
            "&wt=json" +
            "&indent=true" +
            "&limit=" + SOLR_ROW_LIMIT +
            "&facet=true" +
            "&fl=" + fieldList +
            "&indent=true" +

            "&fq=tree:" + type +
            "&fq=" + levelField + ":[" + lvla + "+TO+" + (lvlb + 1) + "]" +
            "&fq={!tag=hoot}" + level_fqs +
            "&facet.mincount=2" +
            "&facet.limit=-1" +
            "&sort=" + levelField + "+asc,position_i+asc,header+asc" +
            "&facet.sort=" + ancestorField + "+ASC" +
            "&facet.field={!ex=hoot}" + ancestorField +
            "&json.facet=" + JSON.stringify(jsonfacetblob) +
            "&wt=json" +
            "&json.wrf=?" +
            "&rows=" + SOLR_ROW_LIMIT;
        return req_url;
    }

    buildAssetQuery(queryObj) {
        var url = this.createBasicQuery(queryObj);
        // console.log("Returning " + url);
        return url;
    }


};