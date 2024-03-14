import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import {
    deleteCallout,
    getCallouts,
    insertCallouts,
    updateCallouts,
} from "../../store/actions/callouts";
import { getMapList } from "../../store/actions/maps";
import MapEditor from "./components/MapEditor";
import EditorStore from "./store/EditorStore";

/*
Injects Map Data and Redux Store to Main Logic Component
 */
const Editor = (props): JSX.Element => {
    const [status, setStatus] = useState({ loading: true, data: undefined });
    // Fetch Map List Data
    const editorStore = EditorStore.useContainer();
    useEffect(() => {
        console.log(props);
        props.getMapList();
    }, []);

    // On data Loaded...
    useEffect(() => {
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
    return <MapEditor store={editorStore} map={status.data} {...props} />;
};

const mapStateToProps = (state) => ({
    mapList: state.maps.mapList,
    inserting: state.callouts.inserting,
    updating: state.callouts.updating,
    loading: state.callouts.loading,
    callouts: state.callouts.callouts,
    insertedCallouts: state.callouts.insertedCallouts,
});

const mapDispatchToProps = (dispatch) => ({
    getCallouts: (map, floor) => {
        dispatch(getCallouts(map, floor));
    },
    insertCallouts: (callouts) => {
        dispatch(insertCallouts(callouts));
    },
    updateCallouts: (callouts) => {
        dispatch(updateCallouts(callouts));
    },
    deleteCallout: (calloutId) => {
        dispatch(deleteCallout(calloutId));
    },
    getMapList: () => {
        dispatch(getMapList());
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(Editor);
