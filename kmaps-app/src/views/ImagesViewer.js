import React from 'react';

export class ImagesViewer extends React.Component {
    constructor(props) {
        super(props);

        console.error(typeof props.sui);
        if (typeof props.sui !== 'object') {
            throw new Error(
                'sui must be passed as a property to the component!'
            );
        }

        if (typeof props.sui.pages !== 'object') {
            throw new Error(
                'sui.pages must be passed as part of the sui passed to the constructor!'
            );
        }

        this.sui = props.sui;
        this.props = props;

        console.log('ImagesViewer props = ', props);
    }

    componentDidMount() {}

    componentDidCatch(error, errorInfo) {}

    componentWillUnmount() {}

    componentDidUpdate(prevProps, prevState, snapshot) {}

    shouldComponentUpdate(nextProps, nextState, nextContext) {}

    render() {
        return (
            <div class={'images legacy'}>
                NOT YET IMPLEMENTED IMAGES LEGACY{' '}
                <pre>{JSON.stringify(this.props.kmasset)}</pre>
            </div>
        );
    }
}
