import React from 'react';
import ReactDOM from 'react-dom';
import Controls from './Controls.jsx';
import OrbitView from './OrbitView.jsx';
import Galaxy, {MAX_DENSITY} from './galaxy.js';
import {DEFAULT_GALAXY_KEY} from './galaxyData.js';

const DEFAULT_SLIDER_VALUES = [0.8, 0.7, 0.5, 0.2, 0.1, 0.08, 0.06, 0.04, 0.02, 0.01];

class DarkMatterSim extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sliderValues: DEFAULT_SLIDER_VALUES,
            density: DEFAULT_SLIDER_VALUES.map(v => Galaxy.sliderValueToDensity(v)),
            isDarkMatterGlowEnabled: true,
            galaxyChoice: DEFAULT_GALAXY_KEY,
        }
    }

    render() {
        return (
            <React.Fragment>
                <OrbitView 
                    density = {this.state.density}
                    sliderValues = {this.state.sliderValues}
                    galaxyChoice = {this.state.galaxyChoice}
                    isDarkMatterGlowEnabled = {this.state.isDarkMatterGlowEnabled}
                    onDensityChange = {this.handleDensityChange.bind(this)}
                    onSliderChange = {this.handleSliderChange.bind(this)}
                />
                <Controls
                    density = {this.state.density}
                    galaxyChoice = {this.state.galaxyChoice}
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

    handleSliderChange(key, val) {
        const newSliderValues = [...this.state.sliderValues];
        const newDensity = [...this.state.density];
        newSliderValues[key] = val;
        newDensity[key] = Galaxy.sliderValueToDensity(val);
        this.setState({
            sliderValues: newSliderValues,
            density: newDensity,
        })
    }

    handleDensityChange(key, val) {
        const newSliderValues = [...this.state.sliderValues];
        const newDensity = [...this.state.density];
        newDensity[key] = val;
        newSliderValues[key] = Galaxy.densityToSliderValue(val);
        this.setState({ 
            sliderValues: newSliderValues,
            density: newDensity,
        });
    }
}

const domContainer = document.querySelector('#sim-root');
ReactDOM.render(<DarkMatterSim />, domContainer);
