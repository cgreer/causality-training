import React, { Component } from 'react';

class EditBox extends Component {

    constructor(props, context) {
        super(props, context)

        this.state = {
            name: "",
            fxn: "",
        }

        this.formID = "nodeEditBox"
    }

    componentDidMount() {

        this.setState({
            name: this.props.nodeInfo.name,
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

                    <div>
                        <label style={labelStyle}>Fxn</label>
                        <input
                            style={inputStyle}
                            type="input"
                            name="fxn"
                            value={this.state.fxn}
                            onChange={(event) => this.setState({fxn: event.target.value})}
                        />
                    </div>

                    <button onClick={() => this.props.onSubmit(this.props.nodeID, this.state)}>Save</button>
                </form>
            </div>
        )

    }
}

export default EditBox;

