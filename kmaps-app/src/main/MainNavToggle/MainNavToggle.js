import React from 'react';
import './MainNavToggle.scss';

export class MainNavToggle extends React.Component {
    constructor(props) {
        super(props);

        this.toggleHamburger = this.toggleHamburger.bind(this);
        this.setHamburgerOpen = this.setHamburgerOpen.bind(this);
    }

    setHamburgerOpen(hamOpen) {}

    toggleHamburger() {
        this.setHamburgerOpen(!this.props.hamburgerOpen);
    }

    componentDidMount() {}

    componentDidUpdate(prevProps, prevState, snapshot) {}

    componentWillUnmount() {}

    componentDidCatch(error, errorInfo) {}

    render() {
        return (
            <div
                onClick={this.toggleHamburger}
                id="sui-hamBut"
                className="sui-hamBut"
                title="Help + options"
            >
                &#xe627;
            </div>
        );
    }
}
