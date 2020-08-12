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
import _ from 'lodash';

export interface HistoryModel {
    historyStack: Location[];
    addLocation: Action<HistoryModel, Location>;
    clear: Action<HistoryModel>;
}

export interface Location {
    hash: string | null;
    key: string | null;
    pathname: string;
    search: string | null;
    state: any | null | undefined;
}

export const historyModel: HistoryModel = {
    addLocation: action((state, location) => {
        const ind = state.historyStack.findIndex((x) => {
            return x.pathname === location.pathname;
        });
        console.log('pathname = ', location.pathname, ' ind = ', ind);

        // remove old one, if its there
        if (ind > -1) {
            state.historyStack.splice(ind, 1);
        }

        // push the new on top of the stack
        state.historyStack.push(location);
    }),

    clear: action((state) => {
        state.historyStack = [];
    }),

    historyStack: [],
};
