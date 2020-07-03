import React from 'react';
import PropTypes from 'prop-types';
import {GALAXIES, GALAXY_DATA} from './galaxyData.js';

/**
 * A Drop Down Menu interface to select a galaxy by name. Used in the simulation
 * to select velocity curve overlays to display on the velocity graph. This
 * component simply allows you to select the galaxy.
 */
export default class GalaxySelectionMenu extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.props.onChange(Number.parseInt(event.target.value));
    }

    render() {
        const galaxyKeys = Object.values(GALAXIES);
        const optionList = galaxyKeys.map((key)=> {
            const displayName = GALAXY_DATA[key].NAME;
            return <option key={key} value={key}>{displayName}</option>
        });
        return (
            <select value={this.props.value} onChange={this.handleChange} id="galaxySelector-select">
                {optionList}
            </select>
        );
    }
}

GalaxySelectionMenu.propTypes = {
    value: PropTypes.number,
    onChange: PropTypes.func,
}