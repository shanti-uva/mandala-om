
export interface KmapModel {
    uid: string;
    kmap: KmapSolrModel;
    asset: KmAssetSolrModel;
    relateds: string[];
}

export const kmapModel: KmapModel = {
    uid: "",
    kmap: { uid:"" },
    asset: { uid:"" },
    relateds: []
}

export interface KmAssetSolrModel {
    schema_version_i?:        number;
    asset_type?:              string;
    service?:                 string;
    id?:                      string;
    uid:                      string;
    uid_i?:                   number;
    url_html?:                string;
    kmapid?:                  string[];
    kmapid_is?:               number[];
    kmapid_strict?:           string[];
    names_txt?:               string[];
    name_autocomplete?:       string[];
    name_tibt?:               string[];
    name_latin?:              string[];
    title?:                   string[];
    feature_types_ss?:        string[];
    ancestors_txt?:           string[];
    ancestor_ids_is?:         number[];
    kmapid_subjects_idfacet?: string[];
    kmapid_places_idfacet?:   string[];
    feature_types_idfacet?:   string[];
    position_i?:              number;
    parent_uid?:              string;
    caption?:                 string;
    _version_?:               number;
    timestamp?:               Date;
}


export interface KmapSolrModel {
    tree?:                                   string;
    feature_types?:                          string[];
    feature_type_ids?:                       number[];
    has_shapes?:                             boolean;
    has_altitudes?:                          boolean;
    block_type?:                             string;
    interactive_map_url?:                    string;
    kmz_url?:                                string;
    closest_fid_with_shapes?:                number;
    id?:                                     string;
    uid?:                                    string;
    uid_i?:                                  number;
    header?:                                 string;
    position_i?:                             number;
    caption_eng?:                            string[];
    text?:                                   string[];
    caption_eng_2_content_t?:                string[];
    summary_eng?:                            string[];
    summary_eng_1_content_t?:                string[];
    illustration_mms_url?:                   string[];
    created_at?:                             Date;
    updated_at?:                             Date;
    "ancestor_id_closest_cult.reg_path"?:    string;
    "level_closest_cult.reg_i"?:             number;
    "ancestor_id_cult.reg_path"?:            string;
    "ancestors_closest_cult.reg"?:           string[];
    "ancestor_ids_closest_cult.reg"?:        number[];
    "ancestor_uids_closest_cult.reg"?:       string[];
    "level_pol.admin.hier_i"?:               number;
    "ancestor_id_pol.admin.hier_path"?:      string;
    "ancestors_pol.admin.hier"?:             string[];
    "ancestor_ids_pol.admin.hier"?:          number[];
    "ancestor_uids_pol.admin.hier"?:         string[];
    "level_closest_hist.pol.admin.unit_i"?:  number;
    "ancestor_id_hist.pol.admin.unit_path"?: string;
    "ancestor_id_closest_elect.rel_path"?:   string;
    "level_closest_elect.rel_i"?:            number;
    "ancestor_id_elect.rel_path"?:           string;
    "ancestors_closest_elect.rel"?:          string[];
    "ancestor_ids_closest_elect.rel"?:       number[];
    "ancestor_uids_closest_elect.rel"?:      string[];
    "level_closest_site.rel_i"?:             number;
    "ancestor_id_site.rel_path"?:            string;
    "level_closest_pol.rel_i"?:              number;
    "level_closest_cult.rel_i"?:             number;
    "ancestor_id_closest_envir.rel_path"?:   string;
    "level_closest_envir.rel_i"?:            number;
    "ancestor_id_envir.rel_path"?:           string;
    "ancestors_closest_envir.rel"?:          string[];
    "ancestor_ids_closest_envir.rel"?:       number[];
    "ancestor_uids_closest_envir.rel"?:      string[];
    "level_closest_admin.rel_i"?:            number;
    "level_closest_org.rel_i"?:              number;
    "level_closest_rel.rel_i"?:              number;
    "level_closest_geo.rel_i"?:              number;
    "name_roman.popular"?:                   string[];
    "name_roman.scholar"?:                   string[];
    "name_trad.chi"?:                        string[];
    "name_simp.chi"?:                        string[];
    "name_pri.tib.sec.roman"?:               string[];
    "name_pri.tib.sec.chi"?:                 string[];
    name_deva?:                              string[];
    name_tibt?:                              string[];
    name_autocomplete?:                      string[];
    name_latin?:                             string[];
    name?:                                   string[];
    name_hans?:                              string[];
    name_zh?:                                string[];
    name_hant?:                              string[];
    ancestors?:                              string[];
    ancestor_ids_generic?:                   number[];
    ancestor_uids_generic?:                  string[];
    ancestor_id_path?:                       string;
    level_i?:                                number;
    _version_?:                              number;
    _timestamp_?:                            Date;
    _childDocuments_?:                       ChildDocuments[];
}

export interface ChildDocuments {
    id?:                               string;
    uid?:                              string;
    related_uid_s?:                    string;
    origin_uid_s?:                     string;
    feature_type_path_s?:              string;
    block_child_type?:                 BlockChildType;
    block_type?:                       BlockType;
    feature_type_name_s?:              string;
    related_names_t?:                  string[];
    feature_type_id_i?:                number;
    _timestamp_?:                      Date;
    related_places_id_s?:              string;
    related_places_header_s?:          string;
    related_places_path_s?:            string;
    related_places_feature_type_s?:    string;
    related_places_feature_type_id_i?: number;
    related_subjects_t?:               string[];
    related_subject_ids?:              string[];
    related_places_feature_types_t?:   string[];
    related_places_feature_type_ids?:  string[];
    related_places_relation_label_s?:  string;
    related_places_relation_code_s?:   string;
    related_kmaps_node_type?:          string[];
}

export enum BlockChildType {
    FeatureTypes = "feature_types",
    RelatedPlaces = "related_places",
}

export enum BlockType {
    Child = "child",
}

