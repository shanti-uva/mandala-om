import React from 'react';

export function SubjectsInfo(props) {
    const { kmap, kmasset } = props;
    // console.log('SubjectsInfo: props = ', props);
    // console.log('SubjectsInfo: kmap = ', kmap);
    // console.log('SubjectsInfo: kmasset = ', kmasset);

    return (
        <div>
            <h2> Yo this is the Subjects joint!</h2>
            <pre>{JSON.stringify({ ...props, sui: null }, undefined, 2)}</pre>
        </div>
    );
}
