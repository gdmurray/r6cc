import React, { Component } from "react";
import { KEYCODES } from "../../constants";

export interface MapProps {}

export interface MapState {
    activeFloor: number;
    activeCallouts: any[];
}

export default class MapWrapper<S extends MapState> extends Component<any, S> {
    public _cache: {};

    getInitialState(): S {
        // @ts-ignore
        return { activeFloor: 0, activeCallouts: [] } as S;
    }

    constructor(props) {
        super(props);
        this._cache = {};
        this.state = this.getInitialState();
    }

    componentDidMount() {
        console.log("component mounting");
        document.addEventListener("keydown", this._handleKeyDown);
        this.props.getCallouts(this.props.map, this.state.activeFloor);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this._handleKeyDown);
    }

    _handleKeyDown = (event) => {
        var { activeFloor } = this.state;
        switch (event.keyCode) {
            case KEYCODES.ARROW_UP:
                event.preventDefault();
                const { mapData } = this.props;
                if (activeFloor < mapData.floors.length - 1) {
                    this.setState({
                        activeFloor: this.state.activeFloor + 1,
                    });
                }
                return;
            case KEYCODES.ARROW_DOWN:
                event.preventDefault();
                if (activeFloor > 0) {
                    this.setState({
                        activeFloor: this.state.activeFloor - 1,
                    });
                }
                return;
            default:
                return true;
        }
    };
}
