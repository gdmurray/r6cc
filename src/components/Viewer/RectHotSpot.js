import React, { Component } from "react";
import { Rect, Group, Text } from "react-konva";
import { MAP_WIDTH, MAP_HEIGHT } from "../../constants";
const pixelWidth = require('string-pixel-width');

export default class RectHotSpot extends Component {
    constructor(props) {
        super(props);
        this.shapeRef = React.createRef();
        this.id = props.id;
        this.callout = props.callout;
        this.callout_alt = props.callout_alt;
        this.shape = props.shape;
        this.map = props.map;
        this.floor = props.floor;
        this.x = this.shape.values[0];
        this.y = this.shape.values[1];
        this.w = this.shape.values[2];
        this.h = this.shape.values[3];
    }

    convertToImageSize = (x, y, w = false, h = false) => {
        /*
          Converts from Current Image Size to Total Image Size
          ie (currentX / currentHeight) * NEW_DIMENSION
        */
        const { imageWidth, imageHeight } = this.props;
        var newX = (x / imageWidth) * MAP_WIDTH;
        var newY = (y / imageHeight) * MAP_HEIGHT;
        var newW = w ? (w / imageWidth) * MAP_WIDTH : w;
        var newH = h ? (h / imageHeight) * MAP_HEIGHT : h;
        return { x: newX, y: newY, w: newW, h: newH }
    }

    convertToCanvasSize = () => {
        /*
          Converts from Total Image Size to Current Image Size
        */
        const { x, y, w, h } = this;
        const { imageWidth, imageHeight } = this.props;
        var newX = Math.round((x / MAP_WIDTH) * imageWidth, 2);
        var newY = Math.round((y / MAP_HEIGHT) * imageHeight, 2);
        var newW = Math.round((w / MAP_WIDTH) * imageWidth, 2);
        var newH = Math.round((h / MAP_HEIGHT) * imageHeight, 2);
        return { x: newX, y: newY, w: newW, h: newH }
    }

    render() {
        const { x, y, w, h } = this.convertToCanvasSize(this.x, this.y);
        let isVertical = h > (w * 1.5);
        let textW = isVertical ? h : w;
        let textH = isVertical ? w : h;
        var textX = x;
        var textY = y;
        if(isVertical){
            textX = x + w;
        }

        var textSize = 3;
        /*var textWidth = pixelWidth(this.callout, {size: textSize})
        while( (textW) <= textWidth && textSize >= 2){
            textWidth = pixelWidth(this.callout, {size: textSize});
            textSize--;
        } */
        return (
            <React.Fragment>
            <Rect
                key={'rect-'+this.id}
                ref={this.shapeRef}
                onClick={() => this.props.onSelect(this)}
                draggable={false}
                onMouseOver={this.handleHover}
                x={x}
                y={y}
                width={w}
                height={h}
                fill={"white"}
                opacity={0.5}
    
            />
            <Text 
                x={textX}
                y={textY}
                width={textW}
                height={textH}
                fontSize={textSize}
                text={this.callout}
                rotation={isVertical ? 90 : 0}
                verticalAlign={"middle"}
                align={"center"}
            />
            </React.Fragment>
        )
    }
}
