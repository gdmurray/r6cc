import React from "react";
import { connect } from 'react-redux'
import MapEditorComponent from "../../components/Editor/MapEditorComponent";
import { insertCallouts, updateCallouts, deleteCallout, getCallouts } from "../../actions/callouts";

const MapEditor = (props) => {
    var mapData = props.mapList.filter(obj => obj.short_code === props.match.params.map)[0];
    return (
        <MapEditorComponent {...props} map={props.match.params.map} mapData={mapData} />
    )
}
const mapStateToProps = (state) => ({
    mapList: state.maps.mapList,
    inserting: state.callouts.inserting,
    updating: state.callouts.updating,
    loading: state.callouts.loading,
    callouts: state.callouts.callouts
})

const mapDispatchToProps = (dispatch) => ({
    getCallouts: (map, floor) => {
        dispatch(getCallouts(map, floor))
    },
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

export default connect(mapStateToProps, mapDispatchToProps)(MapEditor);