import React from "react";
import { push } from "connected-react-router";
import { connect } from 'react-redux'

import MapListComponent from "../../components/Maps/MapListComponent";
import {getMapList} from "../../actions/maps";

const Maps = (props) => {
    return (
            <MapListComponent {...props} />
    )   
}

const mapStateToProps = (state) => ({
    isLoading: state.maps.loadingMaps,
    mapList: state.maps.mapList,
    error: state.maps.mapsError
})

const mapDispatchToProps = (dispatch) => ({
    goToRoute: (route) => {
        dispatch(push(route))
    },
    getMapList: () => {
        dispatch(getMapList())
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(Maps);