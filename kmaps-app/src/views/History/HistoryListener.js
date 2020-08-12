// HISTORY!
import { useHistory } from 'react-router-dom';
import { useEffect } from 'react';

export default function HistoryListener() {
    const history = useHistory();
    console.log('History useHistory = ', history);

    useEffect(() => {
        return history.listen((location) => {
            console.log('History: Location = ', location);
        });
    }, [history]);

    return null;
}
