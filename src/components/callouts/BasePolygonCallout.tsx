import React from "react";
import { MAP_HEIGHT, MAP_WIDTH } from "../../constants";
import { Line } from "konva/types/shapes/Line";
import BaseCallout from "./BaseCallout";
import { BasePolygonProps, BasePolygonState } from "./callouts.interfaces";

let _chunk = require("lodash/chunk");

export default class BasePolygonCallout<
    P extends BasePolygonProps,
    S extends BasePolygonState
> extends BaseCallout<P, S> {
    public shapeRef: React.RefObject<Line>;

    getInitialState(x: number, y: number, points: number[]): S {
        return { x, y, points } as S;
    }

    constructor(props: P) {
        super(props);
        this.shapeRef = React.createRef();
        const { x, y, points } = props.callout.shape.values;
        this.state = this.getInitialState(x, y, points);
    }

    convertToImageSize = (x, y) => {
        /*
          Converts from Current Image Size to Total Image Size
          ie (currentX / currentHeight) * NEW_DIMENSION
        */
        const { imageWidth, imageHeight } = this.props;
        let newX = (x / imageWidth) * MAP_WIDTH;
        let newY = (y / imageHeight) * MAP_HEIGHT;
        return { x: newX.round(2), y: newY.round(2) };
    };

    convertToCanvasSize = () => {
        const { points } = this.state;
        let newPoints: any[] = [];
        const { imageWidth, imageHeight } = this.props;
        _chunk(points, 2).forEach((pair) => {
            const [x, y] = [pair[0], pair[1]];
            let newX = ((x / MAP_WIDTH) * imageWidth).round(2);
            let newY = ((y / MAP_HEIGHT) * imageHeight).round(2);
            newPoints.push(newX, newY);
        });
        return { points: newPoints };
    };
}
