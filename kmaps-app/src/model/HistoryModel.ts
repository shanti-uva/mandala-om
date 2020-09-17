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
    removeType: Action<HistoryModel, Type>;
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

export enum Type {
    'search',
    'visit',
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

function isHistoryType(loc: Location, type: Type) {
    switch (type) {
        case Type.search:
            break;

        case Type.visit:
            break;

        default:
    }
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

    removeType: action((state, type) => {
        console.log('HistoryModel: type = ', type.valueOf());
        console.log('HistoryModel: Type.search = ', Type.search);
        console.log(type == Type.search);
        const newStack = state.historyStack.filter((x) => {
            console.log(' x====> ', JSON.stringify(x));
            if (
                type.valueOf() == Type.search &&
                x.pathname.startsWith('/search/')
            ) {
                console.log('omitting: ', x);

                return false;
            } else {
                return true;
            }
        });
        state.historyStack = newStack;
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
        } else {
            console.log(
                'HistoryModel.ts: remove failed:  location = ',
                location
            );
        }
    }),

    historyStack: [],
};
