import React, { Component } from "react";
import { capitalize } from "../../utils";
import { ORDER_OPTIONS } from "../../constants";
import {
    Segment, Input, Form, Button
} from "semantic-ui-react";

var _isEqual = require('lodash/isEqual');

class CalloutListItemComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editMode: false,
            callout: props.data.callout,
            callout_alt: props.data.callout_alt,
            order: props.data.order,

        }
        this._cache = {
            callout: props.data.callout,
            callout_alt: props.data.callout_alt,
            order: props.data.order
        }
    }

    renderString(str) {
        if (this.state.editMode) {
            return (
                <input name={str} placeholder='First Name' value={this.state[str]} onChange={this.handleInputChange} />
            )
        } else {
            return (
                <div>{this.state[str]}</div>
            )
        }
    }

    handleSave = (event) => {
        const { callout, callout_alt, order } = this.state;

        var calloutData = Object.assign({}, this.props.data);
        
        calloutData.callout = callout;
        calloutData.callout_alt = callout_alt;
        calloutData.order = order;

        if (calloutData.shape.type === "rect") {
            calloutData.shape.values = calloutData.shape.values.map(val => Math.round(val))
        }

        if (calloutData.id.includes("tmp-")) {
            // If the hotspot is new --> Insert Callout
            // Delete from Master Callout List
            this.props.removeUpdatedCalloutCallback(calloutData.id);
            delete calloutData.id;
            // REPLACE WITH SINGULAR
            this.props.insertCallouts([calloutData]);

        }else{
            // Not new --> Update Callout
            // REPLACE WITH SINGULAR
            this.props.updateCallouts([calloutData]);
        }
    }

    handleDelete = (event) => {
        if(!this.props.data.id.includes("tmp-")){
            this.props.deleteCallout(this.props.data.id);
            
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
                    <div>{this.state.order}</div>
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
        this.setState({
            [name]: value
        });
    }

    handleDropdownChange = (e, result) => {
        const { name, value } = result;
        this.setState({
            [name]: value
        })
    }
    
    hasDataChanged = () => {
        var changed = false;
        const keys = ["callout", "callout_alt", "order"];
        for(var key of keys){
            if(this._cache[key] != this.state[key]){
                changed = true;
            }
        }
        return changed;
    }

    render() {
        return (
            <Form className="callout" 
                onMouseEnter={() => this.props.hoverCalloutCallback(this.props.data.id)} 
                onMouseLeave={() => this.props.hoverCalloutCallback(null)} >
                <div className="info">
                    <div className="title">
                        ID: {this.props.data.id}
                    </div>
                    <div className="data">
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
                </div>
                <div className="actions">
                    <Button basic circular size="tiny"
                        icon='save' color='green'
                        disabled={!this.hasDataChanged() && !this.props.data.id.includes("tmp-")}
                        onClick={(e) => this.handleSave(e)} />
                    <Button basic circular size="tiny"
                        icon='pencil' color='yellow'
                        onClick={() => this.toggleEdit()} />
                    <Button basic circular size="tiny"
                        icon='trash' color='red'
                        onClick={(e) => this.handleDelete(e)} />
                </div>
            </Form>
        )
    }
}
class CalloutSidebarComponent extends Component {
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
                                    <li key={"callout-" + index}>
                                        <CalloutListItemComponent data={callout} 
                                            hoverCalloutCallback={this.props.hoverCalloutCallback}
                                            removeUpdatedCalloutCallback={this.props.removeUpdatedCalloutCallback}
                                            {...this.props} />
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


