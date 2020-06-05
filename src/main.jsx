import React from 'react';
import ReactDOM from 'react-dom';
import Controls from './Controls.jsx';
import OrbitView from './OrbitView.jsx';


class DarkMatterSim extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            controls: {
                sliders: [0.8, 0.7, 0.5, 0.2, 0.1, 0.08, 0.06, 0.04, 0.02, 0.01]
            }
        }
    }

    render() {
        return (
            <React.Fragment>
                <OrbitView
                    controls = {this.state.controls}
                />
                {/*
                <Controls
                    controls = {this.state.controls}
                    onChange = {this.handleControlChanges.bind(this)}
                />
                */}
            </React.Fragment>
        );
    }

    handleControlChanges(sliders) {
        this.setState({controls: {sliders}});
    }
}

const domContainer = document.querySelector('#sim-root');
ReactDOM.render(<DarkMatterSim />, domContainer);
