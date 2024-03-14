import React from "react";
import {
    BasePolygonProps,
    BasePolygonState,
} from "../../../../components/callouts/callouts.interfaces";
import { Line } from "react-konva";
import BasePolygonCallout from "../../../../components/callouts/BasePolygonCallout";

export default class MapViewPolygonCallout extends BasePolygonCallout<
    BasePolygonProps,
    BasePolygonState
> {
    render() {
        const { points } = this.convertToCanvasSize();
        return (
            <Line
                ref={this.shapeRef}
                //onClick={() => this.props.onSelect(this)}
                draggable={false}
                key={`poly-` + this.callout.id}
                points={points}
                fill={"white"}
                stroke={"grey"}
                strokeWidth={0.5}
                opacity={0.5}
                closed={true}
            />
        );
    }
}
