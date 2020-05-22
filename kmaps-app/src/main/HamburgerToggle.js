import React from "react";

export class HamburgerToggle extends React.Component {

    constructor(props) {
        super(props);

        this.toggleHamburger = this.toggleHamburger.bind(this);
        this.setHamburgerOpen = this.setHamburgerOpen.bind(this);
    }

    setHamburgerOpen(hamOpen) {
        // send state change message
        this.props.onStateChange({hamburgerOpen: hamOpen});
    }

    toggleHamburger() {
        this.setHamburgerOpen(!this.props.hamburgerOpen);
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    componentWillUnmount() {
    }

    componentDidCatch(error, errorInfo) {
    }

    render() {
        return (
            <div onClick={this.toggleHamburger} id='sui-hamBut' className='sui-hamBut'
                 title='Help + options'>&#xe627;</div>
        )
    }
}