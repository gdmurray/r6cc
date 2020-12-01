import React from "react";
import {
    ICalloutObject,
    BasePolygonProps,
    BasePolygonState,
} from "../../../../components/callouts/callouts.interfaces";
import { Circle, Line } from "react-konva";
import MapEditRectCallout from "./MapEditRectCallout";
import { SNAP_TOLERANCE, TOOLS } from "../../../../constants";
import CalloutTransformComponent from "./CalloutTransformComponent";
import { ICalloutActions } from "../MapEditor";
import { IPoint } from "../../../../components/maps/BaseMapView";
import BasePolygonCallout from "../../../../components/callouts/BasePolygonCallout";

let _chunk = require("lodash/chunk");
let _isEqual = require("lodash/isEqual");
let _cloneDeep = require("lodash/cloneDeep");
const _orderBy = require("lodash/orderBy");

interface DiffObject {
    diff: number;
    point: IPoint;
}

export interface MapEditPolygonHotspotProps extends BasePolygonProps {
    tool: number;
    selectedShape: MapEditRectCallout | MapEditPolygonCallout | null;
    hoveredShapeId: string | null;
    calloutActions: ICalloutActions;

    onSelect(shape: MapEditPolygonCallout): void;

    updateCallout(callout: ICalloutObject): void;
}

export default class MapEditPolygonCallout extends BasePolygonCallout<
    MapEditPolygonHotspotProps,
    BasePolygonState
> {
    private transformStartValues: ICalloutObject | null;
    private isSnapping: boolean;

    constructor(props) {
        super(props);
        this.transformStartValues = null;
        this.isSnapping = false;
    }

    componentDidMount() {
        document.addEventListener("keydown", this.handleKeyDown);
        document.addEventListener("keyup", this.handleKeyUp);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyDown);
        document.removeEventListener("keyup", this.handleKeyUp);
    }

    handleKeyUp = (event) => {
        if (this.isSelected()) {
            if (event.key === "Shift") {
                console.log("No longer snapping");
                this.isSnapping = false;
            }
        }
    };
    handleKeyDown = (event) => {
        if (this.isSelected()) {
            if (event.shiftKey) {
                console.log("Snapping");
                this.isSnapping = true;
            }
        }
    };
    buildPayload = () => {
        const { callout } = this;
        return {
            id: callout.id,
            callout: callout.callout,
            callout_alt: callout.callout_alt,
            map: callout.map,
            floor: callout.floor,
            shape: {
                type: callout.shape.type,
                values: this.state,
            },
        };
    };

    getChunkArray = (points) => {
        let chunkArray: any[] = [];
        _chunk(points, 2).forEach((pair) => {
            chunkArray.push(pair);
        });
        return chunkArray;
    };

    shouldComponentUpdate(
        nextProps: Readonly<MapEditPolygonHotspotProps>,
        nextState: Readonly<BasePolygonState>,
        nextContext: any
    ): boolean {
        return (
            !_isEqual(this.props, nextProps) || !_isEqual(this.state, nextState)
        );
    }

    componentDidUpdate(
        prevProps: Readonly<MapEditPolygonHotspotProps>,
        prevState: Readonly<BasePolygonState>,
        snapshot?: any
    ) {
        if (!_isEqual(prevProps.callout, this.props.callout)) {
            console.log("%c PROP CHANGE", "color: blue");
            const { values } = this.props.callout.shape;
            console.log("Props: ", values);
            console.log("State: ", this.state);
            if (!_isEqual(this.state, values)) {
                console.log(
                    "%cReceived new values from props... setting new state",
                    "color: green"
                );
                console.log("Setting to: ", values);
                this.setState({
                    ...values,
                });
            }
        }
    }

    isSelected = (): boolean => {
        const { selectedShape } = this.props;
        if (selectedShape) {
            const { callout } = this;
            const selectedCallout = selectedShape.callout;
            if (callout.id === selectedCallout.id) {
                return true;
            }
        }
        return false;
    };

    isPointTransforming = (): boolean => {
        const { tool } = this.props;
        return this.isSelected() && tool === TOOLS.POINT_TRANSFORM;
    };

    getAdjacentPoints = (index: number): { previous: IPoint; next: IPoint } => {
        /*
            Index is actual index in the points list, so its pairIndex multiplied by 2
            [0,1|2,3|4,5|6,7|8,9]
            0 | 2 | 4 | 6 | 8
         */
        const { points } = this.state;
        // Im just going to assume there will always be at least 3 points... considering its not a line, its a shape.
        // if (points.length >= 6 && points.length % 2 === 0) {
        // 3 Or more points, can try snapping
        let lastIndex = (points.length / 2 - 1) * 2;
        let prevIndex = (index / 2 - 1) * 2;
        let nextIndex = (index / 2 + 1) * 2;

        if (index === 0) {
            // if index at start of array. go to last element; need to get to 8 + 9
            prevIndex = lastIndex;
            //const prevPoint = {x: points[lastIndex], y: points[lastIndex + 1]}
        } else if (index === lastIndex) {
            // If index at end of array, go get first one
            nextIndex = 0;
        }
        const prevPoint = {
            x: points[prevIndex],
            y: points[prevIndex + 1],
        };
        const nextPoint = {
            x: points[nextIndex],
            y: points[nextIndex + 1],
        };
        return {
            previous: prevPoint,
            next: nextPoint,
        };
        // return {
        //     previous: null,
        //     next: null,
        // };
    };

    onDragMove = (e, index: number) => {
        const node = e.target;
        const oX = node.x();
        const oY = node.y();
        let { x, y } = this.convertToImageSize(oX, oY);
        const { points } = this.state;
        let newPoints = [...points];
        const arrIndex = index * 2;

        // Implements Snapping if holding shift
        if (this.isSnapping) {
            const { previous, next } = this.getAdjacentPoints(arrIndex);
            const shape = this.shapeRef.current;
            if (shape) {
                const stage = shape.getStage();
                if (stage) {
                    const stageChildren = stage.getChildren((node) => {
                        return node.attrs.name === "floorLayer";
                    });
                    if (stageChildren.length === 1) {
                        const imageLayer = stageChildren[0];
                        const point = stage.getPointerPosition();
                        const transform = imageLayer
                            .getAbsoluteTransform()
                            .copy();
                        transform.invert();
                        const transformedPoint = transform.point(
                            point as IPoint
                        );
                        const snapPoint = {
                            x: transformedPoint.x.round(2),
                            y: transformedPoint.y.round(2),
                        };

                        const xDiffs: DiffObject[] = _orderBy(
                            [
                                {
                                    diff: Math.abs(
                                        previous.x - snapPoint.x
                                    ).round(2),
                                    point: previous,
                                },
                                {
                                    diff: Math.abs(next.x - snapPoint.x).round(
                                        2
                                    ),
                                    point: next,
                                },
                            ],
                            ["diff"],
                            ["asc"]
                        );

                        const yDiffs: DiffObject[] = _orderBy(
                            [
                                {
                                    diff: Math.abs(
                                        previous.y - snapPoint.y
                                    ).round(2),
                                    point: previous,
                                },
                                {
                                    diff: Math.abs(next.y - snapPoint.y).round(
                                        2
                                    ),
                                    point: next,
                                },
                            ],
                            ["diff"],
                            ["asc"]
                        );

                        if (xDiffs[0].diff < SNAP_TOLERANCE) {
                            const { point } = xDiffs[0];
                            x = point.x;
                            node.x(x);
                        }

                        if (yDiffs[0].diff < SNAP_TOLERANCE) {
                            const { point } = yDiffs[0];
                            y = point.y;
                            node.y(y);
                        }
                    }
                }
            }
        }

        newPoints[arrIndex] = x;
        newPoints[arrIndex + 1] = y;
        this.setState({
            points: newPoints,
        });
    };

    getFillColor = (): string => {
        if (this.props.hoveredShapeId) {
            if (this.props.hoveredShapeId === this.props.callout.id) {
                return "blue";
            }
        }
        if (this.isSelected()) {
            return "green";
        }
        return "white";
    };

    render() {
        //console.log("STATE POINTS: ", this.state.points);
        const { points } = this.convertToCanvasSize();
        //console.log(points);
        //console.log("RENDERED POINTS: ", points);
        if (this.isPointTransforming()) {
            const chunkArr = this.getChunkArray(points);
            return (
                <>
                    <Line
                        ref={this.shapeRef}
                        onClick={() => this.props.onSelect(this)}
                        points={points}
                        key={`poly-0`}
                        fill={"white"}
                        stroke={"grey"}
                        strokeWidth={0.5}
                        opacity={0.5}
                        closed={true}
                    />
                    {chunkArr.map((pair, index) => {
                        return (
                            <Circle
                                key={`point-${index}`}
                                x={pair[0]}
                                y={pair[1]}
                                draggable={true}
                                onDragStart={() => {
                                    this.transformStartValues = _cloneDeep(
                                        this.buildPayload()
                                    );
                                }}
                                onDragMove={(e) => this.onDragMove(e, index)}
                                onDragEnd={(e) => {
                                    const { calloutActions } = this.props;
                                    const node = e.target;
                                    const [oX, oY] = [node.x(), node.y()];
                                    const { x, y } = this.convertToImageSize(
                                        oX,
                                        oY
                                    );
                                    const { points } = this.state;
                                    const arrIndex = index * 2;
                                    let newPoints = [...points];
                                    newPoints[arrIndex] = x;
                                    newPoints[arrIndex + 1] = y;
                                    this.setState({
                                        points: newPoints,
                                    });
                                    const updatedCallout = this.buildPayload();
                                    // todo: maybe only compare values... for performance reasons?
                                    if (
                                        !_isEqual(
                                            updatedCallout,
                                            this.transformStartValues
                                        ) &&
                                        this.transformStartValues
                                    ) {
                                        calloutActions.transform(
                                            this.transformStartValues,
                                            updatedCallout
                                        );
                                        this.transformStartValues = null;
                                        calloutActions.update(updatedCallout);
                                    }
                                }}
                                radius={1}
                                fill={"white"}
                                stroke={"black"}
                                strokeWidth={0.25}
                            />
                        );
                    })}
                </>
            );
        }
        return (
            <>
                <Line
                    x={this.state.x}
                    y={this.state.y}
                    ref={this.shapeRef}
                    onClick={() => this.props.onSelect(this)}
                    draggable={this.isSelected() && !this.isPointTransforming()}
                    key={`poly-` + this.callout.id}
                    points={points}
                    fill={this.getFillColor()}
                    stroke={"grey"}
                    strokeWidth={0.5}
                    opacity={0.5}
                    closed={true}
                    onDragStart={() => {
                        this.transformStartValues = _cloneDeep(
                            this.buildPayload()
                        );
                    }}
                    onDragEnd={(e) => {
                        const node = this.shapeRef.current;
                        if (node) {
                            const { calloutActions } = this.props;
                            this.setState({
                                x: e.target.x().round(2),
                                y: e.target.y().round(2),
                            });
                            const updatedCallout = this.buildPayload();
                            if (
                                !_isEqual(
                                    updatedCallout,
                                    this.transformStartValues
                                ) &&
                                this.transformStartValues
                            ) {
                                console.log("adding to undo: ", calloutActions);
                                calloutActions.transform(
                                    this.transformStartValues,
                                    updatedCallout
                                );
                                this.transformStartValues = null;
                                calloutActions.update(this.buildPayload());
                            }
                        }
                    }}
                />
                {this.isSelected() && !this.isPointTransforming() ? (
                    <CalloutTransformComponent
                        selectedShape={this}
                        tool={this.props.tool}
                    />
                ) : null}
            </>
        );
    }
}
