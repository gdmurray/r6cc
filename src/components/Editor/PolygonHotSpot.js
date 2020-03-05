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

    buildPayload = () => {
        var payload = {
            id: this.id,
            callout: this.callout,
            callout_alt: this.callout_alt,
            map: this.map,
            floor: this.floor,
            shape: {
                type: this.shape.type,
                values: this.state.points
            }
        }
        return payload
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

    isPointTransforming = () => {
        console.log("ptf: ", this.id === this.props.pointTransformId)
        console.log(this.id, this.props.pointTransformId);
        return (this.id === this.props.pointTransformId)
    }

    getTransformedPoints = () => {
        var transformedPoints = [];
        const { points } = this.state;
        _chunk(points, 2).forEach((pair, index) => {
            const { x, y } = this.convertToImageSize(pair[0], pair[1]);
            transformedPoints.push(x, y);
        })
        return transformedPoints;
    }

    getChunkArray = (points) => {
        var chunkArray = [];
        _chunk(points, 2).forEach((pair) => {
            chunkArray.push(pair);
        })
        return chunkArray
    }


    render() {
        const { points } = this.convertToCanvasSize()

        if (this.isPointTransforming()) {
            const chunkArr = this.getChunkArray(points);
            return (
                <React.Fragment>
                    <Line
                        ref={this.shapeRef}
                        onClick={() => this.props.onSelect(this)}
                        draggable={this.id === this.props.selected}
                        key={`poly-0`}
                        points={points}
                        fill={"white"}
                        stroke={"grey"}
                        strokeWidth={0.5}
                        opacity={0.5}
                        closed={true}
                        onDragEnd={e => {
                            const node = this.shapeRef.current;
                            console.log(node);
                        }}
                    />
                    {chunkArr.map((pair, index) => {
                        return (
                            <Circle
                                key={`point-${index}`}
                                x={pair[0]}
                                y={pair[1]}
                                draggable={true}
                                onDragMove={e => {
                                    const node = e.target;
                                    var oX = node.x();
                                    var oY = node.y();
                                    const { x, y } = this.convertToImageSize(oX, oY);
                                    const { points } = this.state;
                                    var newPoints = [...points];
                                    var arrIndex = index * 2;
                                    newPoints[arrIndex] = x;
                                    newPoints[arrIndex + 1] = y;
                                    this.setState({
                                        points: newPoints
                                    })
                                }}
                                onDragEnd={e => {
                                    const node = e.target;
                                    var oX = node.x();
                                    var oY = node.y();
                                    const { x, y } = this.convertToImageSize(oX, oY);
                                    const { points } = this.state;
                                    var arrIndex = index * 2;
                                    var newPoints = [...points];
                                    newPoints[arrIndex] = x;
                                    newPoints[arrIndex + 1] = y;
                                    this.setState({
                                        points: newPoints
                                    })
                                    var payload = this.buildPayload();
                                    console.log(payload);
                                    this.props.updateCallout(this.buildPayload());
                                }}
                                radius={1}
                                fill={"white"}
                                stroke={"black"}
                                strokeWidth={0.25} />
                        );
                    })}
                </React.Fragment>
            )
        } else {
            return (
                <Line
                    ref={this.shapeRef}
                    onClick={() => this.props.onSelect(this)}
                    draggable={this.id === this.props.selected}
                    key={`poly-0`}
                    points={points}
                    fill={this.id === this.props.selectedForEdit ? "green" : "white"}
                    stroke={"grey"}
                    strokeWidth={0.5}
                    opacity={0.5}
                    closed={true}
                    onDragEnd={e => {
                        const node = this.shapeRef.current;
                        console.log(node);
                    }}
                    /*onTransformEnd={e => {
                        const node = this.shapeRef.current;
                        const scaleX = node.scaleX();
                        const scaleY = node.scaleY();
                        console.log(scaleX, scaleY);
                        console.log(node.getAbsoluteTransform());
                        console.log(node.getTransform())
                        console.log(node.getSelfRect());
                        console.log(node.getAbsoluteScale());
                        console.log(e);
                        console.log(node.attrs.points);
                        var newPoints = [];
                        _chunk(node.attrs.points, 2).forEach((pair) => {
                            var {x, y} = this.convertToImageSize(pair[0], pair[1])
                            newPoints.push(x);
                            newPoints.push(y);
                        })
                        console.log(newPoints);
                        this.setState({
                            points: newPoints
                        });
                        this.props.updateCallout(this.buildPayload())
                    }}*/
                />
            )
        }
    }
}