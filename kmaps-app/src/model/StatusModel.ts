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
    path: string[];
    id: string | null;

    setType: Action<StatusModel, string>;
    setHeaderTitle: Action<StatusModel, string>;
    setId: Action<StatusModel, string>;
    setPath: Action<StatusModel, string[]>;
    setSubTitle: Action<StatusModel, string>;
    setStatus: Action<StatusModel, StatusModel>;
    clear: Action<StatusModel>;
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
        state.id = id;
    }),
    setPath: action((state, path) => {
        state.path = path;
    }),
    setSubTitle: action((state, subTitle) => {
        state.subTitle = subTitle;
    }),
    setHeaderTitle: action((state, title) => {
        console.log('TRYING TO SET title = ', title);
        state.headerTitle = title;
    }),
    setType: action((state, type) => {
        state.type = type;
    }),
    setStatus: action((state, status) => {
        state = { ...status };
    }),
};
