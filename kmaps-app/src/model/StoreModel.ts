import {SearchModel, searchModel} from "./SearchModel";
import {KmapModel, kmapModel} from "./KmapModel";
import {createTypedHooks} from "easy-peasy";

export interface StoreModel {
    kmap: KmapModel;
    search: SearchModel;
}

export const storeModel: StoreModel = {
    kmap: kmapModel,
    search: searchModel
}

export const {
    useStoreActions,
    useStoreState,
    useStoreDispatch,
    useStore
} = createTypedHooks <StoreModel > ();


