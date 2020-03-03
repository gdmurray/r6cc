import React, { Component } from "react";
import { Line, Circle } from "react-konva";
import { MAP_WIDTH, MAP_HEIGHT } from "../../constants";
let _chunk = require("lodash/chunk");

export default class PolygonHotSpot extends Component {
    constructor(props) {
        super(props);
        this.shapeRef = React.createRef();
        this.id = props.id;
        this.callout = props.callout;
        this.callout_alt = props.callout_alt;
        this.shape = props.shape;
        this.map = props.map;
        this.floor = props.floor;

        this.state = {
            points: props.shape.values
        }

    }

    convertToImageSize = (x, y) => {
        /*
          Converts from Current Image Size to Total Image Size
          ie (currentX / currentHeight) * NEW_DIMENSION
        */
        const { imageWidth, imageHeight } = this.props;
        var newX = (x / imageWidth) * MAP_WIDTH;
        var newY = (y / imageHeight) * MAP_HEIGHT;
        return { x: newX, y: newY }
        /*
         if (points.length % 2 === 0) {
             const { imageWidth, imageHeight } = this.props;
             _chunk(points, 2).forEach((pair, index) => {
                 console.log(pair, index);
             })
         } else {
             console.log("Array of uneven size");
         }*/
        //var newX = (x / imageWidth) * MAP_WIDTH;
        //var newY = (y / imageHeight) * MAP_HEIGHT;
        //var newW = w ? (w / imageWidth) * MAP_WIDTH : w;
        //var newH = h ? (h / imageHeight) * MAP_HEIGHT : h;
        //return { x: newX, y: newY, w: newW, h: newH }
    }

    convertToCanvasSize = () => {
        const { points } = this.state;
        var newPoints = [];
        const { imageWidth, imageHeight } = this.props;
        _chunk(points, 2).forEach((pair) => {
            var x = pair[0];
            var y = pair[1];
            var newX = (x / MAP_WIDTH) * imageWidth;
            var newY = (y / MAP_HEIGHT) * imageHeight;
            newPoints.push(newX, newY);
        })
        return { points: newPoints }
    }

    isSelected = () => {
        return (this.id === this.props.selected)
    }

    render() {
        const { points } = this.convertToCanvasSize()
        return (
            <Line
                ref={this.shapeRef}
                onClick={() => this.props.onSelect(this)}
                draggable={false}
                key={`poly-`+this.id}
                points={points}
                fill={"white"}
                stroke={"grey"}
                strokeWidth={0.5}
                opacity={0.5}
                closed={true}
            />
        )
    }
}