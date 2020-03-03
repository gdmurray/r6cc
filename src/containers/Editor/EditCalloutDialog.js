import React from "react";
import {connect} from "react-redux";
import {EditCalloutDialogComponent} from "../../components/Editor";
import { insertCallouts, updateCallouts, deleteCallout, getCallouts } from "../../actions/callouts";

const EditCalloutDialog = (props) => {
    if(props.selectedId !== null){
        let callout = props.callouts.filter(obj => obj.id === props.selectedId)[0];
        return (
            <EditCalloutDialogComponent {...props} data={callout} />
        )
    }
    return (null);
}


const mapStateToProps = (state) => ({
    inserting: state.callouts.inserting,
    updating: state.callouts.updating,
})

const mapDispatchToProps = (dispatch) => ({
    insertCallouts: (callouts) => {
        dispatch(insertCallouts(callouts))
    },
    updateCallouts: (callouts) => {
        dispatch(updateCallouts(callouts))
    },
    deleteCallout: (calloutId) => {
        dispatch(deleteCallout(calloutId))
    }
})
export default connect(mapStateToProps, mapDispatchToProps)(EditCalloutDialog);