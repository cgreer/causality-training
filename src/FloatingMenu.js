import React, { Component } from 'react';

class Menu extends Component {

    constructor(props, context) {
        super(props, context)

        this.state = {
            items: [],
            selected: "hello",
        }
    }

    componentDidMount() {

        this.setState({
            items: this.props.items,
        })
    }

    renderItems = () => {

        let baseStyle = {
            display: "block",
            textAlign: "left",
            width: "100%",
            boxSizing: "border-box",
            padding: "1px",
        }

        let items = []
        this.state.items.forEach(item => {

            // Make selected style adustments
            var itemStyle = baseStyle
            if (this.state.selected === item) {
                itemStyle = {...baseStyle, backgroundColor: "blue"}
            }

            items.push(<div
                style={itemStyle}

                onClick={(event) => {
                    this.props.onMenuItemClick(item)
                }}

                onMouseEnter={() => {this.setState({selected: item})}}
                >

                {item}

            </div>)
        })

        return items
    }

    render() {

        let outerStyle = {
            position: "absolute",
            border: "1px solid",

            left: this.props.left + "px",
            top: this.props.top + "px",

            width: "200px",

            backgroundColor: "white",

            zIndex: 10,
        }

        return (

            <div style={outerStyle}>
                {this.renderItems()}
            </div>
        )

    }
}

export default Menu;

