import React from 'react';
import PropTypes from 'prop-types';
import NumberInputField from './NumberInputField.jsx';
import GalaxySelectionMenu from './GalaxySelectionMenu.jsx';
import {MAX_DENSITY} from './galaxy.js';

export default class Controls extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const boxes = this.props.density.map((v, k) => {
            return (
                <NumberInputField
                    type="number"
                    id={`densityInputBox${k}`}
                    value={this.props.density[k]}
                    min={0}
                    max={MAX_DENSITY}
                    key={k}
                    name={k}
                    sliderKey={k}
                    onChange={this.onChange.bind(this)}
                />
            )
        });

        return (
            <React.Fragment>
            <div id="darkMatterGlow-container" onClick={this.onCheckBoxClick.bind(this)}>
                <input 
                    id="darkMatterGlow-checkbox"
                    type="checkbox" 
                    checked={this.props.isDarkMatterGlowEnabled}
                    onChange={this.onChange.bind(this)} 
                />
                <div id="darkMatterGlow-label">
                    Show Dark Matter
                </div>
            </div>
            <div id="densityInputBox-container">
                {boxes}
            </div>
            <div id="galaxySelector-container">
                <GalaxySelectionMenu 
                    value={this.props.galaxyChoice}
                    onChange={this.handleGalaxyChange.bind(this)}
                />
            </div>
            </React.Fragment>
        );
    }

    onChange(key, value) {
        // console.log(`key=${key}, value=${value}`);
        this.props.onDensityChange(key, value);
    }

    onCheckBoxClick() {
        this.props.onChange("isDarkMatterGlowEnabled", !this.props.isDarkMatterGlowEnabled);
    }

    handleGalaxyChange(value) {
        this.props.onChange("galaxyChoice", value);
    }
}

Controls.propTypes = {
    density: PropTypes.arrayOf(PropTypes.number).isRequired,
    galaxyChoice: PropTypes.number.isRequired,
    isDarkMatterGlowEnabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    onDensityChange: PropTypes.func.isRequired,
}