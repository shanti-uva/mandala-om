import React from 'react';
import { Parser } from 'html-to-react';
import $ from 'jquery';
import { withRouter } from 'react-router-dom';

class LegacyViewer extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.sui = props.sui;

        const id = this.props.id || this.props.match.params.id;

        this.sui.GetKmapFromID(id, (kmasset) => {
            console.log('LegacyViewer: kmasset = ', kmasset);
            if (
                !this.state ||
                !this.state.kmasset ||
                (kmasset.uid && kmasset.uid !== this.state.kmasset.uid)
            ) {
                this.state = { kmasset: kmasset, id: id };
                this.sui.pages.Draw(this.state.kmasset, false);
                console.log('LegacyViewer: whoop');
            }
        });
    }

    render() {
        const parser = new Parser(); // html-to-jsx parser
        const viewer = parser.parse($(this.sui.pages.div).html());
        const relateds = parser.parse($(this.sui.pages.reldiv).html());
        console.log('LegacyViewer VIEWER = ', viewer);
        console.log('LegacyViewer RELDIV = ' + relateds);
        return <div className={'legacyviewer'}>{viewer}</div>;
    }
}

export default withRouter(LegacyViewer);
