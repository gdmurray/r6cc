import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { clearCallouts, getCallouts } from "../../store/actions/callouts";
import MapViewer from "./components/MapViewer";
import { getMapList } from "../../store/actions/maps";

const initialProps = {
    loading: true,
    data: {
        id: "0",
        name: "base",
        short_code: "base",
        floors: [],
    },
};
const Viewer = (props) => {
    const [status, setStatus] = useState(initialProps);

    useEffect(() => {
        //props.clearCallouts();
        props.getMapList();
    }, []);

    useEffect(() => {
        console.log("MapList Loaded");
        if (props.mapList) {
            const mapData = props.mapList.filter(
                (obj) => obj.short_code === props.match.params.map
            )[0];
            setStatus({
                loading: false,
                data: mapData,
            });
        }
    }, [props.mapList]);

    if (status.loading) {
        return <div>Loading</div>;
    }
    return (
        <MapViewer
            callouts={props.callouts}
            map={status.data}
            loading={props.loading}
            getCallouts={props.getCallouts}
        />
    );
};

const mapStateToProps = (state) => ({
    mapList: state.maps.mapList,
    loading: state.callouts.loading,
    callouts: state.callouts.callouts,
});

const mapDispatchToProps = (dispatch) => ({
    getCallouts: (map, floor) => {
        dispatch(getCallouts(map, floor));
    },
    getMapList: () => {
        dispatch(getMapList());
    },
    clearCallouts: () => {
        dispatch(clearCallouts());
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(Viewer);
