import { SearchModel, searchModel } from './SearchModel';
import { KmapModel, kmapModel } from './KmapModel';
import { StatusModel, statusModel } from './StatusModel';
import { createTypedHooks } from 'easy-peasy';
import { HistoryModel, historyModel } from './HistoryModel';

export interface StoreModel {
    kmap: KmapModel;
    search: SearchModel;
    status: StatusModel;
    history: HistoryModel;
}

export const storeModel: StoreModel = {
    kmap: kmapModel,
    search: searchModel,
    status: statusModel,
    history: historyModel,
};

export const {
    useStoreActions,
    useStoreState,
    useStoreDispatch,
    useStore,
} = createTypedHooks<StoreModel>();
