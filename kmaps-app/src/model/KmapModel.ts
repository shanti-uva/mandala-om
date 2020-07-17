import {
    action,
    Action,
    ThunkOn,
    thunkOn,
    thunk,
    Thunk,
    computed,
    Computed,
} from 'easy-peasy';
import {
    getRelatedAssetsPromise,
    getAssetDataPromise,
    getFullKmapDataPromise,
} from '../logic/searchapi';
import { StoreModel } from './StoreModel';

interface KmRelatedsSolrMode {
    uid: string;
    relateds: [];
}

export interface KmapModel {
    uid: string;
    stateKey: Computed<KmapModel, any, StoreModel>;
    loading: boolean;
    kmap: KmapSolrModel;
    asset: KmAssetSolrModel;
    relateds: KmAssetSolrModel[];
    relatedsPage: RelatedsPage;

    // RELATEDS PAGING ACTIONS
    gotoRelatedsPage: Action<KmapModel, number>;
    nextRelatedsPage: Action<KmapModel>;
    prevRelatedsPage: Action<KmapModel>;
    firstRelatedsPage: Action<KmapModel>;
    lastRelatedsPage: Action<KmapModel>;
    setRelatedsPage: Action<KmapModel, RelatedsPage>;
    setRelatedsPageSize: Action<KmapModel, number>;

    // setting the primary UID
    setUid: Action<KmapModel, string>;

    // receives changes from update();
    receiveKmap: Action<KmapModel, any>;

    // thunk for updating after any change
    update: Thunk<KmapModel, void, any, StoreModel, any>; // see https://easy-peasy.now.sh/docs/typescript-tutorial/adding-typed-thunks.html
    onUpdate: ThunkOn<KmapModel, StoreModel>;
}

export const kmapModel: KmapModel = {
    loading: false,
    stateKey: computed((state) => {
        return (
            state.kmap.uid +
            '/' +
            state.relatedsPage?.related_type +
            '/' +
            state.relatedsPage?.page +
            '/' +
            state.relatedsPage?.pageSize
        );
    }),
    uid: '',
    kmap: { uid: '' },
    asset: { uid: '' },
    relateds: [],
    relatedsPage: {
        related_type: null,
        page: 0,
        pageSize: 100,
    },
    gotoRelatedsPage: action((state, pageNum) => {
        state.relatedsPage.page = pageNum;
    }),
    firstRelatedsPage: action((state) => {
        state.relatedsPage.page = 0;
    }),
    lastRelatedsPage: action((state) => {
        throw new Error('need maxpage!');
    }),
    nextRelatedsPage: action((state) => {
        state.relatedsPage.page++;
    }),
    prevRelatedsPage: action((state) => {
        state.relatedsPage.page--;
    }),
    setRelatedsPage: action((state, relatedsPage) => {
        state.relatedsPage = relatedsPage;
    }),
    setRelatedsPageSize: action((state, relatedsPageSize) => {
        state.relatedsPage.pageSize = relatedsPageSize;
    }),
    receiveKmap: action((state, kmap) => {
        console.log(' receiveKmap received: ', kmap);
        //  what do we do with this?
    }),

    setUid: action((state, uid) => {
        state.uid = uid;
        console.log('KmapModel: set uid = ', uid, state);
    }),
    onUpdate: thunkOn(
        (actions, storeActions) => [
            actions.gotoRelatedsPage,
            actions.nextRelatedsPage,
            actions.prevRelatedsPage,
            actions.firstRelatedsPage,
            actions.lastRelatedsPage,
            actions.setRelatedsPage,
            actions.setUid,
        ],
        async (actions, target) => {
            actions.update();
        }
    ),

    // Do the deed
    update: thunk(async (actions, payload, helpers) => {
        const kmapState = helpers.getStoreState().kmap;
        kmapState.loading = true;

        // TODO: How do we get these values?
        //  NEED TO GET related assets only when needed...?
        const type = kmapState.relatedsPage.related_type;
        const start =
            kmapState.relatedsPage.page * kmapState.relatedsPage.pageSize;
        const rows = kmapState.relatedsPage.pageSize;

        console.log('KmapModel update thunk: kmapState: ', kmapState);
        console.log('KmapModel update thunk: kmapState.uid: ', kmapState.uid);

        console.log('KmapModel update thunk:type: ', type);
        console.log('KmapModel update thunk: start: ', start);
        console.log('KmapModel update thunk: rows: ', rows);

        const promises = [
            getAssetDataPromise(kmapState.uid),
            getFullKmapDataPromise(kmapState.uid),
            getRelatedAssetsPromise(kmapState.uid, type, start, rows),
        ];

        Promise.allSettled(promises)
            .then(([kmasset_result, kmap_result, relateds_result]) => {
                console.log(
                    'kmapModel Promises settled: kmasset:',
                    kmasset_result
                );
                console.log('kmapModel Promises settled: kmap:', kmap_result);
                console.log(
                    'kmapModel Promises settled: relateds:',
                    relateds_result
                );
                if (kmap_result.status === 'fulfilled') {
                    kmapState.kmap = kmap_result.value;
                }
                if (kmasset_result.status === 'fulfilled') {
                    kmapState.asset = kmasset_result.value;
                }
                if (relateds_result.status === 'fulfilled') {
                    kmapState.relateds = relateds_result.value;
                }

                actions.receiveKmap(kmapState);
            })
            .catch((e) => {
                console.error('oh dear! ', e);
                throw e;
            });
        kmapState.loading = false;
    }),
};

interface RelatedsPage {
    // stateKey: Computed<KmapModel, any, StoreModel>
    related_type: string | null;
    page: number;
    pageSize: number;
}

// interface RelatedAsset {
//     related_type: string;
//     field: string;
//     uid: string;
//     page: number;
//     pageSize: number;
// }

// MODEL KMASSET (kmassets)
export interface KmAssetSolrModel {
    schema_version_i?: number;
    asset_type?: string;
    service?: string;
    id?: string;
    uid: string;
    uid_i?: number;
    url_html?: string;
    kmapid?: string[];
    kmapid_is?: number[];
    kmapid_strict?: string[];
    names_txt?: string[];
    name_autocomplete?: string[];
    name_tibt?: string[];
    name_latin?: string[];
    title?: string[];
    feature_types_ss?: string[];
    ancestors_txt?: string[];
    ancestor_ids_is?: number[];
    kmapid_subjects_idfacet?: string[];
    kmapid_places_idfacet?: string[];
    feature_types_idfacet?: string[];
    position_i?: number;
    parent_uid?: string;
    caption?: string;
    _version_?: number;
    timestamp?: Date;
}

// MODEL KMAP (kmterms)
export interface KmapSolrModel {
    tree?: string;
    feature_types?: string[];
    feature_type_ids?: number[];
    has_shapes?: boolean;
    has_altitudes?: boolean;
    block_type?: string;
    interactive_map_url?: string;
    kmz_url?: string;
    closest_fid_with_shapes?: number;
    id?: string;
    uid?: string;
    uid_i?: number;
    header?: string;
    position_i?: number;
    caption_eng?: string[];
    text?: string[];
    caption_eng_2_content_t?: string[];
    summary_eng?: string[];
    summary_eng_1_content_t?: string[];
    illustration_mms_url?: string[];
    created_at?: Date;
    updated_at?: Date;
    'ancestor_id_closest_cult.reg_path'?: string;
    'level_closest_cult.reg_i'?: number;
    'ancestor_id_cult.reg_path'?: string;
    'ancestors_closest_cult.reg'?: string[];
    'ancestor_ids_closest_cult.reg'?: number[];
    'ancestor_uids_closest_cult.reg'?: string[];
    'level_pol.admin.hier_i'?: number;
    'ancestor_id_pol.admin.hier_path'?: string;
    'ancestors_pol.admin.hier'?: string[];
    'ancestor_ids_pol.admin.hier'?: number[];
    'ancestor_uids_pol.admin.hier'?: string[];
    'level_closest_hist.pol.admin.unit_i'?: number;
    'ancestor_id_hist.pol.admin.unit_path'?: string;
    'ancestor_id_closest_elect.rel_path'?: string;
    'level_closest_elect.rel_i'?: number;
    'ancestor_id_elect.rel_path'?: string;
    'ancestors_closest_elect.rel'?: string[];
    'ancestor_ids_closest_elect.rel'?: number[];
    'ancestor_uids_closest_elect.rel'?: string[];
    'level_closest_site.rel_i'?: number;
    'ancestor_id_site.rel_path'?: string;
    'level_closest_pol.rel_i'?: number;
    'level_closest_cult.rel_i'?: number;
    'ancestor_id_closest_envir.rel_path'?: string;
    'level_closest_envir.rel_i'?: number;
    'ancestor_id_envir.rel_path'?: string;
    'ancestors_closest_envir.rel'?: string[];
    'ancestor_ids_closest_envir.rel'?: number[];
    'ancestor_uids_closest_envir.rel'?: string[];
    'level_closest_admin.rel_i'?: number;
    'level_closest_org.rel_i'?: number;
    'level_closest_rel.rel_i'?: number;
    'level_closest_geo.rel_i'?: number;
    'name_roman.popular'?: string[];
    'name_roman.scholar'?: string[];
    'name_trad.chi'?: string[];
    'name_simp.chi'?: string[];
    'name_pri.tib.sec.roman'?: string[];
    'name_pri.tib.sec.chi'?: string[];
    name_deva?: string[];
    name_tibt?: string[];
    name_autocomplete?: string[];
    name_latin?: string[];
    name?: string[];
    name_hans?: string[];
    name_zh?: string[];
    name_hant?: string[];
    ancestors?: string[];
    ancestor_ids_generic?: number[];
    ancestor_uids_generic?: string[];
    ancestor_id_path?: string;
    level_i?: number;
    _version_?: number;
    _timestamp_?: Date;
    _childDocuments_?: ChildDocuments[];
}

export interface ChildDocuments {
    id?: string;
    uid?: string;
    related_uid_s?: string;
    origin_uid_s?: string;
    feature_type_path_s?: string;
    block_child_type?: BlockChildType;
    block_type?: BlockType;
    feature_type_name_s?: string;
    related_names_t?: string[];
    feature_type_id_i?: number;
    _timestamp_?: Date;
    related_places_id_s?: string;
    related_places_header_s?: string;
    related_places_path_s?: string;
    related_places_feature_type_s?: string;
    related_places_feature_type_id_i?: number;
    related_subjects_t?: string[];
    related_subject_ids?: string[];
    related_places_feature_types_t?: string[];
    related_places_feature_type_ids?: string[];
    related_places_relation_label_s?: string;
    related_places_relation_code_s?: string;
    related_kmaps_node_type?: string[];
}

export enum BlockChildType {
    FeatureTypes = 'feature_types',
    RelatedPlaces = 'related_places',
}

export enum BlockType {
    Child = 'child',
}
