import React from 'react';
import PropTypes from 'prop-types';

export default class NumberInputField extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: 0,
            hasFocus: false
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.value !== prevProps.value) {
            this.setState({ 
                value: this.props.value.toPrecision(3)
            });
        }
    }

    render() {
        let value;
        if (this.state.hasFocus === true) {
            value = this.state.value
        } else {
            // value = this.props.value.toExponential(2);
            value = this.props.value.toPrecision(3);
        }
        return (
            <form
                onSubmit={this.handleSubmit.bind(this)}
                style={{display: "inline-block"}}
                noValidate={true}
                >
                <input
                    type="number"
                    name="numberInputBox"
                    className="densityInputBox"
                    // min={this.props.min}
                    // max={this.props.max}
                    onChange={this.handleChange.bind(this)}
                    onFocus={this.handleFocus.bind(this)}
                    onBlur={this.handleBlur.bind(this)}
                    value={value}
                    spellCheck="false"
                />
            </form>
        );
    }

    handleFocus() {
        this.setState({
            hasFocus: true,
            value: this.props.value.toPrecision(3)
        });
    }

    handleBlur() {
        this.setState({
            hasFocus: false,
            value: this.props.value,
        });
    }

    handleChange(event) {
        this.setState({
            value: event.target.value
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        let value = event.target.numberInputBox.value;
        if (value === "") {
            return;
        }
        value = Number.parseFloat(value);
        value = Math.min(Math.max(value, this.props.min), this.props.max);
        this.props.onChange(this.props.sliderKey, value);
    }

    padDecimals(number) {
        return Number.parseFloat(number).toFixed(this.props.decimals);
    }
}

NumberInputField.propTypes = {
    sliderKey: PropTypes.number,
    min: PropTypes.number,
    max: PropTypes.number,
    value: PropTypes.number,
    onChange: PropTypes.func,
}