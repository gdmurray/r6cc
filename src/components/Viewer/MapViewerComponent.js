import React, { Component } from "react";
import { KEYCODES } from "../../constants";
import {ViewerFloorMap} from "../Viewer";
/*
    Not Needed At the moment
*/
class MapViewerComponent extends Component {
    /*
        Preload url map information
    */
    constructor(props) {
        super(props);
        this._cache = {}
        this.state = {
            activeFloor: 0,
            activeCallouts: []
        }
    }

    componentDidMount() {
        document.addEventListener("keydown", this._handleKeyDown);
        this.props.getCallouts(this.props.map, this.state.activeFloor);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this._handleKeyDown);
    }

    calloutsFloorChanged(prevCallouts, callouts) {
        if (prevCallouts.length > 0 && callouts.length > 0) {
            if (prevCallouts[0].floor !== callouts[0].floor) {
                return true
            }
        }
        return false;
    }

    componentDidUpdate(prevProps, prevState) {
        const { activeFloor } = this.state;
        const { callouts } = this.props;

        // ActiveFloor Changed
        if (prevState.activeFloor !== activeFloor) {

            // Callouts Exist in Cache
            if (this._cache[activeFloor] !== undefined) {

                // Set activeCallouts from cache
                this.setState({
                    activeCallouts: this._cache[`${this.props.map}-${activeFloor}`]
                })
            } else {
                // Fetch New Callouts from reducer
                console.log("fetching new callouts");
                this.props.getCallouts(this.props.map, activeFloor);
            }
            // Callouts Floor Changed ==> When to set the activeCallouts State
        } else if (this.calloutsFloorChanged(prevProps.callouts, callouts)) {
            this.setState({
                activeCallouts: callouts
            })
        }
    }

    _handleKeyDown = event => {
        var { activeFloor } = this.state;
        switch (event.keyCode) {
          case KEYCODES.ARROW_UP:
            event.preventDefault();
            const { mapData } = this.props;
            if (activeFloor < (mapData.floors.length - 1)) {
              this.setState({
                activeFloor: this.state.activeFloor + 1
              })
            }
            return
          case KEYCODES.ARROW_DOWN:
            event.preventDefault();
            if (activeFloor > 0) {
              this.setState({
                activeFloor: this.state.activeFloor - 1
              })
            }
            return
          default:
            return true;
        }
      }

    render() {
        // Cache callouts in component
        if(this._cache[`${this.props.map}-${this.state.activeFloor}`] === undefined){
            this._cache[`${this.props.map}-${this.state.activeFloor}`] = this.state.activeCallouts;
        }
        return (
            <div>
                <ViewerFloorMap
                activeFloor={this.state.activeFloor}
                activeCallouts={this.state.activeCallouts}
                {...this.props} />
            </div>
        );
    }
}

export default MapViewerComponent;