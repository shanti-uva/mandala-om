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
import { StoreModel } from './StoreModel';

export interface StatusModel {
    type: string | null;
    headerTitle: string | null;
    subTitle: string | null;
    path: Link[];
    id: string | null;

    setType: Action<StatusModel, string>;
    setHeaderTitle: Action<StatusModel, string>;
    setId: Action<StatusModel, string>;
    setPath: Action<StatusModel, Link[]>;
    setSubTitle: Action<StatusModel, string>;
    setStatus: Action<StatusModel, StatusModel>;
    clear: Action<StatusModel>;
}

export interface Link {
    uid: string;
    name: string;
}

export const statusModel: StatusModel = {
    type: null,
    headerTitle: 'Mandala',
    subTitle: null,
    path: [],
    id: null,

    // ACTIONS
    clear: action((state) => {
        state.id = null;
        state.type = null;
        state.subTitle = null;
        state.headerTitle = null;
        state.path = [];
        state.id = null;
    }),
    setId: action((state, id) => {
        document.title = state.headerTitle + ' (' + id + ')';
        state.id = id;
    }),
    setPath: action((state, path) => {
        state.path = path;
    }),
    setSubTitle: action((state, subTitle) => {
        state.subTitle = subTitle;
    }),
    setHeaderTitle: action((state, title) => {
        document.title = title + (state.id ? ' (' + state.id + ')' : '');
        state.headerTitle = title;
    }),
    setType: action((state, type) => {
        state.type = type;
    }),
    setStatus: action((state, status) => {
        state = { ...status };
    }),
};
