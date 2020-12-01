import React from "react";
import { push } from "connected-react-router";
import { connect } from "react-redux";

import { getMapList } from "../../store/actions/maps";

import MapList from "./components/MapList";
import AppWrapper from "../../components/navigation/AppWrapper";

const Maps = (props) => {
    return (
        <AppWrapper withFooter={true}>
            <MapList {...props} />
        </AppWrapper>
    );
};

const mapStateToProps = (state) => ({
    isLoading: state.maps.loadingMaps,
    mapList: state.maps.mapList,
    error: state.maps.mapsError,
});

const mapDispatchToProps = (dispatch) => ({
    goToRoute: (route) => {
        dispatch(push(route));
    },
    getMapList: () => {
        dispatch(getMapList());
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(Maps);
