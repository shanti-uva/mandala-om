import { action, useStoreActions } from 'easy-peasy';
import { StatusModel } from '../model/StatusModel';

function useStatus() {
    const statusActions = <StatusModel>(
        useStoreActions((actions) => actions.status)
    );
    return statusActions;
}
export default useStatus;
