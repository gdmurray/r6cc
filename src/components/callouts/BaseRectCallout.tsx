import React from "react";
import { Rect } from "konva/types/shapes/Rect";
import { MAP_HEIGHT, MAP_WIDTH } from "../../constants";
import BaseCallout from "./BaseCallout";
import { BaseRectProps, BaseRectState } from "./callouts.interfaces";

export default class BaseRectCallout<
    P extends BaseRectProps,
    S extends BaseRectState
> extends BaseCallout<P, S> {
    getInitialState(x: number, y: number, w: number, h: number): S {
        return {
            x,
            y,
            w,
            h,
        } as S;
    }

    public shapeRef: React.RefObject<Rect>;

    constructor(props) {
        super(props);
        this.shapeRef = React.createRef();
        const [x, y, w, h] = this.callout.shape.values
            ? this.callout.shape.values
            : [0, 0, 0, 0];

        this.state = this.getInitialState(x, y, w, h);
    }

    /**
     Converts from Current Image Size to Total Image Size
     ie (currentX / currentHeight) * NEW_DIMENSION
     */
    convertToImageSize = ({
        x,
        y,
        w,
        h,
    }: {
        x: number;
        y: number;
        w: number;
        h: number;
    }) => {
        const { imageWidth, imageHeight } = this.props;
        let newX = (x / imageWidth) * MAP_WIDTH;
        let newY = (y / imageHeight) * MAP_HEIGHT;
        let newW = (w / imageWidth) * MAP_WIDTH;
        let newH = (h / imageHeight) * MAP_HEIGHT;
        return { x: newX, y: newY, w: newW, h: newH };
    };

    /**
     Converts from Total Image Size to Current Image Size
     */
    convertToCanvasSize = () => {
        const { x, y, w, h } = this.state;
        const { imageWidth, imageHeight } = this.props;
        let newX = ((x / MAP_WIDTH) * imageWidth).round(2);
        let newY = ((y / MAP_HEIGHT) * imageHeight).round(2);
        let newW = ((w / MAP_WIDTH) * imageWidth).round(2);
        let newH = ((h / MAP_HEIGHT) * imageHeight).round(2);
        return { x: newX, y: newY, w: newW, h: newH };
    };
}
