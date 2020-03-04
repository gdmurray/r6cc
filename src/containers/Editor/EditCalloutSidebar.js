import React from "react";
import {connect} from "react-redux";
import {CalloutSidebarComponent} from "../../components/Editor";
import {insertCallouts, updateCallouts, deleteCallout } from "../../actions/callouts";

const EditCalloutSidebar = (props) => {
    return (
        <CalloutSidebarComponent {...props}/>
    )
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
export default connect(mapStateToProps, mapDispatchToProps)(EditCalloutSidebar);