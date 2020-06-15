import React from 'react';
import NumberInputField from './NumberInputField.jsx';
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
                    Show Dark Matter Glow
                </div>
            </div>
            <div id="densityInputBox-container">
                {boxes}
            </div>
            </React.Fragment>
        );
    }

    onChange(key, value) {
        console.log(`key=${key}, value=${value}`);
        this.props.onDensityChange(key, value);
    }

    onCheckBoxClick() {
        this.props.onChange("isDarkMatterGlowEnabled", !this.props.isDarkMatterGlowEnabled);
    }
}
