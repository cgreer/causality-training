import React, { Component } from 'react';

class Form extends Component {

    constructor(props, context) {
        super(props, context)

        this.state = {
            name: "",
        }

        this.formID = "modelEditBox"
    }

    componentDidMount() {

        this.setState({
            name: this.props.name,
        })

        // Select first form element
        setTimeout(() => {
            let firstInputElement = document.getElementById(this.formID).querySelector("input")
            firstInputElement.select()
            firstInputElement.setSelectionRange(0, firstInputElement.value.length)
        })

    }

    render() {

        let style = {
            position: "absolute",
            border: "1px solid",

            left: this.props.left + "px",
            top: this.props.top + "px",

            width: "200px",

            backgroundColor: "gray",

            zIndex: 10,
        }

        let labelStyle = {
            display: "block",
            textAlign: "left",
        }

        let inputStyle = {
            display: "block",
            width: "100%",
            border: "1px solid #ced4da",
            boxSizing: "border-box",
            padding: "5px",
        }

        let formButton = <button
                onSubmit={(event) => {
                    event.preventDefault()
                    this.props.onSubmit(this.state)
                }}
                onClick={(event) => {
                    this.props.onSubmit(this.state)
                }}
            >
                Save
        </button>

        return (

            <div style={style}>
                <form id={this.formID}>
                    <div>
                        <label style={labelStyle}>Name</label>
                        <input
                            style={inputStyle}
                            type="input"
                            name="name"
                            value={this.state.name}
                            onChange={(event) => this.setState({name: event.target.value})}
                        />
                    </div>

                    {formButton}
                </form>
            </div>
        )

    }
}

export default Form;

