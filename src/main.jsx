import React from 'react';
import ReactDOM from 'react-dom';
import Controls from './Controls.jsx';
import OrbitView from './OrbitView.jsx';
import {MAX_DENSITY} from './galaxy.js';

class DarkMatterSim extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            density: [0.8, 0.7, 0.5, 0.2, 0.1, 0.08, 0.06, 0.04, 0.02, 0.01].map(x => x*MAX_DENSITY),
            isDarkMatterGlowEnabled: true,
        }
    }

    render() {
        return (
            <React.Fragment>
                <OrbitView 
                    density = {this.state.density}
                    isDarkMatterGlowEnabled = {this.state.isDarkMatterGlowEnabled}
                    onDensityChange = {this.handleDensityChange.bind(this)}
                />
                <Controls
                    density = {this.state.density}
                    isDarkMatterGlowEnabled = {this.state.isDarkMatterGlowEnabled}
                    onChange = {this.handleControlChanges.bind(this)}
                    onDensityChange = {this.handleDensityChange.bind(this)}
                />
            </React.Fragment>
        );
    }

    handleControlChanges(key, val) {
        this.setState({[key]: val});
    }

    handleDensityChange(key, val) {
        let newDensity = this.state.density;
        newDensity[key] = val;
        this.setState({ density: newDensity });
    }
}

const domContainer = document.querySelector('#sim-root');
ReactDOM.render(<DarkMatterSim />, domContainer);
