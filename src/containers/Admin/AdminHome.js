import React, { Component } from "react";
import { push } from "connected-react-router";
import { connect } from "react-redux";
import {mapsRef} from "../../firebase";
import mapData from "../../maps.json";

class Admin extends Component {
    loadMapData(){
        for(var map of mapData){
            mapsRef.add(map);
        }
        alert(`Inserted: ${mapData.length} items`)
    }
    render() {
        return (
            <div>
                <h1>Admin Page</h1>
                <button onClick={() => this.props.goToRoute("/admin/maps")}>Go to Maps</button>
                <button onClick={() => this.loadMapData()}>Insert Map Data</button>
            </div>
        )
    }
}


const mapDispatchToProps = (dispatch) => ({
    goToRoute: (route) => {
        dispatch(push(route))
    }
})

export default connect(null, mapDispatchToProps)(Admin);