import React, { useEffect } from 'react';
import useStatus from '../hooks/useStatus';

export function SubjectsHome(props) {
    const status = useStatus();

    useEffect(() => {
        status.clear();
        status.setHeaderTitle('Subjects Home');
    });

    return <> Subjects Home: Not much here yet.. </>;
}

export default SubjectsHome;
