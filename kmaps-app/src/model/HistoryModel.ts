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
    removeLocation: Action<HistoryModel, Location>;
    clear: Action<HistoryModel>;
}

export interface Location {
    hash: string | null;
    key: string | null;
    pathname: string;
    search: string | null;
    state: any | null | undefined;
}

function sameLocation(x: Location, location: Location) {
    if (x.key === location.key) return true;

    // compare all fields except "key" and "name"
    const a = JSON.stringify({ ...x, key: null, name: null });
    const b = JSON.stringify({ ...location, key: null, name: null });

    if (a === b) {
        return true;
    }

    return false;
}

export const historyModel: HistoryModel = {
    addLocation: action((state, location) => {
        const ind = state.historyStack.findIndex((x) => {
            return sameLocation(x, location);
        });
        // console.log('pathname = ', location.pathname, ' ind = ', ind);

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

    removeLocation: action((state, location) => {
        // console.error('removeLocation: ', location);
        const ind = state.historyStack.findIndex((x) => {
            return sameLocation(x, location);
        });

        // remove it, if its there
        if (ind > -1) {
            console.log('removing item number ' + ind);
            state.historyStack.splice(ind, 1);
        }
    }),

    historyStack: [],
};
