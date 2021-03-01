import { action, useStoreActions } from 'easy-peasy';
import { StatusModel } from '../model/StatusModel';

/* This passes the StatusModel actions:


So a Component would use it like this:

    const status = useStatus();

    status.clear();
    status.setHeaderTitle(data.title);
    status.setType(data.asset_type);
    status.setId(data.id);

Currently these are the Actions that are passed:

    setType(string)
    setHeaderTitle(string)
    setId(string)
    setPath(string[])
    setSubTitle(string)
    setStatus(StatusModel)
    clear()

    It is currently in use in src/main/ContentHeader.js via Easy Peasy state.

    TODO: Review whether this is a safe practice to just pass the full Easy Peasy StatusModel
    Maybe I should write a proxy object.   It would be nice if the proxy dynamically updated the functions it's proxying.

 */

function useStatus() {
    // Temporary Status Actions to get Site to work
    const newStatusActions = {
        setType: function (s: string): void {},
        setHeaderTitle: function (s: string): void {},
        setId: function (s: string): void {},
        setPath: function (s: string): void {},
        setSubTitle: function (s: string): void {},
        setStatus: function (s: string): void {},
        clear: function (): void {},
    };
    return newStatusActions;
    /*
    const statusActions = <StatusModel>(
        useStoreActions((actions) => actions.status)
    );
    return statusActions;
     */
}
export default useStatus;
