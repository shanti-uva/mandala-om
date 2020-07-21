import { SearchModel, searchModel } from './SearchModel';
import { KmapModel, kmapModel } from './KmapModel';
import { StatusModel, statusModel } from './StatusModel';
import { createTypedHooks } from 'easy-peasy';

export interface StoreModel {
    kmap: KmapModel;
    search: SearchModel;
    status: StatusModel;
}

export const storeModel: StoreModel = {
    kmap: kmapModel,
    search: searchModel,
    status: statusModel,
};

export const {
    useStoreActions,
    useStoreState,
    useStoreDispatch,
    useStore,
} = createTypedHooks<StoreModel>();
