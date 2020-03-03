import React from "react";
import { connect } from 'react-redux'
import {MapViewerComponent} from "../../components/Viewer/";
import { getCallouts } from "../../actions/callouts";


const MapViewer = (props) => {
    var mapData = props.mapList.filter(obj => obj.short_code === props.match.params.map)[0];
    return (
        <MapViewerComponent {...props} map={props.match.params.map} mapData={mapData}/>
    )
}

const mapStateToProps = (state) => ({
    mapList: state.maps.mapList,
    loading: state.callouts.loading,
    callouts: state.callouts.callouts
})

const mapDispatchToProps = (dispatch) => ({
    getCallouts: (map, floor) => {
        dispatch(getCallouts(map, floor))
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(MapViewer);