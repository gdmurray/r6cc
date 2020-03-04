import React, { Component } from "react";
import { Rect, Group } from "react-konva";
import { MAP_WIDTH, MAP_HEIGHT } from "../../constants";
export default class RectHotSpot extends Component {
    constructor(props) {
        super(props);
        //console.log("HOTSPOT CONSTRUCTOR: ", props);
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

    componentDidUpdate(props) {
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

    buildPayload = () => {
        var payload = {
            id: this.id,
            callout: this.callout,
            callout_alt: this.callout_alt,
            map: this.map,
            floor: this.floor,
            shape: {
                type: this.shape.type,
                values: [this.x, this.y, this.w, this.h]
            }
        }
        return payload
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

    savePoint = (x, y, w = false, h = false) => {
        this.x = x;
        this.y = y;

        // Set W and H if exists
        this.w = w ? w : this.w;
        this.h = h ? h : this.h;
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
        //console.log("Rendering shape with id: " + this.id);
        var fillColor;
        if (this.props.hoveredShapeId === this.id) {
            fillColor = "blue";
        }
        else if (this.props.selectedForEdit === this.id) {
            fillColor = "green"
        } else {
            fillColor = "white"
        }

        return (
            <Rect
                ref={this.shapeRef}
                onClick={() => this.props.onSelect(this)}
                draggable={this.id === this.props.selected}
                onMouseOver={this.handleHover}
                x={x}
                y={y}
                width={w}
                height={h}
                fill={fillColor}
                opacity={0.5}
                onDragEnd={e => {
                    const node = this.shapeRef.current;
                    const { x, y } = this.convertToImageSize(node.x(), node.y());
                    this.savePoint(x, y);
                    this.props.updateCallout(this.buildPayload());
                }}
                onTransformEnd={e => {
                    const node = this.shapeRef.current;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    //console.log(node);
                    node.scaleX(1);
                    node.scaleY(1);
                    var tx = node.x();
                    var ty = node.y();
                    var tw = node.width() * scaleX; Math.max(5, node.width() * scaleX);
                    var th = node.height() * scaleY; Math.max(node.height() * scaleY);

                    console.log("Transformer values: ", tx, ty, tw, th);
                    const { x, y, w, h } = this.convertToImageSize(tx, ty, tw, th);
                    console.log("Scale Transformed Values: ", x, y, w, h);
                    this.savePoint(x, y, w, h);
                    this.props.updateCallout(this.buildPayload());
                }}
            />
        )
    }
}
