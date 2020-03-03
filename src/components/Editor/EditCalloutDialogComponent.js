import React, { Component } from "react";
import {EDIT_CALLOUTS_EVENT} from "../../constants"; 
import {
    Modal, Button, Icon, Form
} from "semantic-ui-react";

class EditCalloutDialogComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            callout: props.data.callout,
            callout_alt: props.data.callout_alt,
            order: props.data.order
        }
        console.log(this.state);
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
            delete calloutData.id;
            this.props.insertCallouts([calloutData]);
        }else{
            // Not new --> Update Callout
            this.props.updateCallouts([calloutData]);
        }

        this.props.onClose(EDIT_CALLOUTS_EVENT.SAVE);
    }

    handleDelete = (event) => {
        if(!this.props.data.id.includes("tmp-")){
            this.props.deleteCallout(this.props.data.id);
            
        }
        this.props.onClose(EDIT_CALLOUTS_EVENT.DELETE);
    }

    render() {
        let options = [];
        for (var i = -1; i <= 10; i++) {
            options.push({ key: i.toString(), text: i.toString(), value: i })
        }
        return (
            <Modal
                style={{ backgroundColor: "transparent" }}
                closeOnDimmerClick={false}
                closeOnDocumentClick={false}
                open={this.props.editModalOpen}
                onClose={() => this.props.onClose(EDIT_CALLOUTS_EVENT.CANCEL)}
                closeIcon={true}>
                <Modal.Header>
                    Edit Callout
                    </Modal.Header>
                <Modal.Content>
                    <Form>
                        <Form.Input label="Callout" placeholder="Callout" name="callout"
                            value={this.state.callout}
                            onChange={this.handleInputChange} />
                        <Form.Input label="Callout Alternative" name="callout_alt" placeholder="Callout Alternative"
                            value={this.state.callout_alt}
                            onChange={this.handleInputChange} />
                        <Form.Select
                            fluid
                            label="Order"
                            name="order"
                            options={options}
                            onChange={this.handleDropdownChange}
                            value={this.state.order}
                        />
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button color="red">
                        Delete&nbsp;&nbsp;&nbsp;<Icon name="trash alternate" />
                    </Button>
                    <Button color="green" onClick={this.handleSave}>
                        Save&nbsp;&nbsp;&nbsp;<Icon name="save" />
                    </Button>
                </Modal.Actions>
            </Modal>


        )
    }
}

export default EditCalloutDialogComponent