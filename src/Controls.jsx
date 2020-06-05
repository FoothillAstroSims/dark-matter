import React from 'react';

export default class Controls extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const sliders = this.props.controls.sliders.map((v, k) => {
            return (
                <input
                    type="range"
                    orient="vertical"
                    id={`slider{k}`}
                    value={v}
                    key={k}
                    name={k}
                    onChange={this.onChange.bind(this)}
                ></input>
            )
        });

        return (
            <React.Fragment>
            <fieldset>
                <legend>Dark Matter Density Input</legend>
                {sliders}
            </fieldset>
            </React.Fragment>
        );
    }

    onChange(event) {
        let sliders = this.props.controls.sliders;
        sliders[parseInt(event.target.name)] = parseFloat(event.target.value);
        this.props.onChange(sliders)
    }
}
