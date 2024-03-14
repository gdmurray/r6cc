import BaseRectCallout from "../../../../components/callouts/BaseRectCallout";
import { Rect } from "react-konva";
import React from "react";

export default class MapEditFocalPoint extends BaseRectCallout<any, any> {
    render() {
        const { x, y, w, h } = this.convertToCanvasSize();
        return (
            <Rect
                ref={this.shapeRef}
                x={x}
                y={y}
                width={w}
                height={h}
                fillEnabled={false}
            />
        );
    }
}
