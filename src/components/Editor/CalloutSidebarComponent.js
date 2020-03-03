import React, { Component } from "react";
import { capitalize } from "../../utils";
import { ORDER_OPTIONS } from "../../constants";
import {
    Segment, Input, Form, Button
} from "semantic-ui-react";

class CalloutListItemComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editMode: false,
            callout: props.callout,
            callout_alt: props.callout_alt,
            order: props.order
        }
    }

    renderString(str) {
        if (this.state.editMode) {
            return (
                <input name={str} placeholder='First Name' value={this.state[str]} onChange={this.handleInputChange} />
            )
        } else {
            return (
                <div>{this.props[str]}</div>
            )
        }
    }

    renderSelect() {
        if (this.state.editMode) {
            return (
                <Form.Select
                    inline
                    fluid
                    label="Order"
                    name="order"
                    options={ORDER_OPTIONS}
                    onChange={this.handleDropdownChange}
                    value={this.state.order}
                />
            )
        } else {
            return (
                <Form.Field inline>
                    <label>Order</label>
                    <div>{this.props.order}</div>
                </Form.Field>
            )
        }
    }

    toggleEdit = () => {
        this.setState(prevState => ({
            editMode: !prevState.editMode
        }))
    }

    handleInputChange = (event) => {
        const target = event.target, value = target.type ===
            'checkbox' ? target.checked : target.value,
            name = target.name

        console.log(name, value);
        this.setState({
            [name]: value
        });
    }

    handleDropdownChange = (e, result) => {
        const { name, value } = result;
        console.log(name, value);
        this.setState({
            [name]: value
        })
    }




    render() {
        let options = [];
        for (var i = -1; i <= 10; i++) {
            options.push({ key: i.toString(), text: i.toString(), value: i })
        }
        console.log(options);
        return (
            <Form className="callout">
                <div className="info">
                    <Form.Field inline>
                        <label>Callout</label>
                        {this.renderString('callout')}
                    </Form.Field>
                    <Form.Field inline>
                        <label>Callout Alt.</label>
                        {this.renderString('callout_alt')}
                    </Form.Field>
                    {this.renderSelect()}
                </div>
                <div className="actions">
                    <Button basic circular size="tiny" icon='save' color='green' />
                    <Button onClick={() => this.toggleEdit()} basic circular size="tiny" icon='pencil' color='yellow' />
                    <Button basic circular size="tiny" icon='trash' color='red' />
                </div>
            </Form>
        )
    }
}
class CalloutSidebarComponent extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.sidebarOpen) {
            return (
                <div className="callout-sidebar">
                    <div className="sidebar-top">
                        <Input icon='search' placeholder='Search...' />
                    </div>
                    <div className="sidebar-map-info">
                        {capitalize(this.props.map)} - Floor {this.props.floor}
                    </div>
                    <div className="sidebar-bottom">
                        <ul>
                            {this.props.callouts.map((callout, index) => {
                                return (
                                    <li>
                                        <CalloutListItemComponent {...callout} />
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </div>
            )
        } else {
            return null;
        }
    }
}

export default CalloutSidebarComponent;


