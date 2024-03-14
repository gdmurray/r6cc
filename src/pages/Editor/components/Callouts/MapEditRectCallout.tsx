import React from "react";
import {
    ICalloutObject,
    BaseRectProps,
    BaseRectState,
} from "../../../../components/callouts/callouts.interfaces";
import { Rect } from "react-konva";
import MapEditPolygonCallout from "./MapEditPolygonCallout";
import { TOOLS } from "../../../../constants";
import { ICalloutActions } from "../MapEditor";
import CalculatedText from "../../../../components/callouts/CalculatedText";
import CalloutTransformComponent from "./CalloutTransformComponent";
import BaseRectCallout from "../../../../components/callouts/BaseRectCallout";

const _isEqual = require("lodash/isEqual");
const _cloneDeep = require("lodash/cloneDeep");

export interface MapEditRectHotspotProps extends BaseRectProps {
    tool: number;
    selectedShape: MapEditRectCallout | MapEditPolygonCallout | null;
    hoveredShapeId: string | null;

    visibleText: boolean;

    onSelect(shape: MapEditRectCallout): void;

    calloutActions: ICalloutActions;
}

export default class MapEditRectCallout extends BaseRectCallout<
    MapEditRectHotspotProps,
    BaseRectState
> {
    private transformStartValues: ICalloutObject | null;

    constructor(props) {
        super(props);
        this.transformStartValues = null;
    }

    buildPayload = () => {
        const { x, y, w, h } = this.state;
        const { callout } = this;
        return {
            id: callout.id,
            callout: callout.callout,
            callout_alt: callout.callout_alt,
            map: callout.map,
            floor: callout.floor,
            shape: {
                type: callout.shape.type,
                values: [x, y, w, h],
            },
        };
    };

    shouldComponentUpdate(
        nextProps: Readonly<MapEditRectHotspotProps>,
        nextState: Readonly<BaseRectState>,
        nextContext: any
    ): boolean {
        return (
            !_isEqual(this.props, nextProps) || !_isEqual(this.state, nextState)
        );
    }

    componentDidUpdate(
        prevProps: Readonly<MapEditRectHotspotProps>,
        prevState: Readonly<BaseRectState>
    ) {
        if (!_isEqual(prevProps.callout, this.props.callout)) {
            //console.log("%c PROP CHANGE", "color: blue");
            //console.log("not equal: ", prevProps.callout, this.props.callout);

            // console.log("Props from: ", prevProps.callout.shape);
            // console.log("Props to: ", this.props.callout.shape);
            // console.log("State from: ", prevState);
            // console.log("State to: ", this.state);

            const { shape } = this.props.callout;
            const { x, y, w, h } = this.state;
            const comp = [x, y, w, h];
            // console.log(shape.values, comp);
            if (!_isEqual(shape.values, comp)) {
                // console.log("%cNot equal, assume undo?", "color: green");
                const [tX, tY, tW, tH] = shape.values;
                this.setState({
                    x: tX,
                    y: tY,
                    w: tW,
                    h: tH,
                });
            }
        }
    }

    isSelected = (): boolean => {
        const { selectedShape } = this.props;
        if (selectedShape) {
            const { callout } = this;
            const selectedCallout = selectedShape.callout;
            return callout.id === selectedCallout.id;
        }
        return false;
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
        // console.log("RAW POINTS: ", this.state);
        const { x, y, w, h } = this.convertToCanvasSize();
        // console.log("CONVERTED POINTS: ", x, y, w, h);
        const { tool, callout } = this.props;

        return (
            <>
                <Rect
                    ref={this.shapeRef}
                    name={"callout"}
                    onClick={() => this.props.onSelect(this)}
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill={this.getFillColor()}
                    opacity={0.5}
                    draggable={this.isSelected() && tool === TOOLS.TRANSFORM}
                    onDragStart={() => {
                        this.transformStartValues = _cloneDeep(
                            this.buildPayload()
                        );
                    }}
                    onDragEnd={() => {
                        const node = this.shapeRef.current;
                        if (node) {
                            const { calloutActions } = this.props;
                            const { w, h } = this.state;
                            const { x, y } = this.convertToImageSize({
                                x: node.x(),
                                y: node.y(),
                                w,
                                h,
                            }) as { x: number; y: number };
                            this.setState({ x, y, w, h });

                            const updatedCallout = this.buildPayload();
                            if (
                                !_isEqual(
                                    this.transformStartValues,
                                    updatedCallout
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
                        }
                    }}
                    onTransformStart={() => {
                        this.transformStartValues = _cloneDeep(
                            this.buildPayload()
                        );
                    }}
                    onTransformEnd={() => {
                        const node = this.shapeRef.current;
                        if (node) {
                            const { calloutActions } = this.props;
                            const scaleX = node.scaleX();
                            const scaleY = node.scaleY();
                            //console.log(node);
                            node.scaleX(1);
                            node.scaleY(1);
                            let [tx, ty] = [node.x(), node.y()];
                            let tw = node.width() * scaleX;
                            Math.max(5, node.width() * scaleX);
                            let th = node.height() * scaleY;
                            Math.max(node.height() * scaleY);

                            const { x, y, w, h } = this.convertToImageSize({
                                x: tx,
                                y: ty,
                                w: tw,
                                h: th,
                            });

                            this.setState({ x, y, w, h });
                            const updatedCallout = this.buildPayload();
                            if (
                                !_isEqual(
                                    this.transformStartValues,
                                    updatedCallout
                                ) &&
                                this.transformStartValues
                            ) {
                                calloutActions.transform(
                                    this.transformStartValues,
                                    updatedCallout
                                );
                                this.transformStartValues = null;
                            }
                            calloutActions.update(updatedCallout);
                        }
                    }}
                />
                {this.props.visibleText &&
                callout.callout.length > 0 &&
                !this.isSelected() ? (
                    <CalculatedText
                        onSelect={this.props.onSelect}
                        parent={this}
                        shape={{ x, y, w, h }}
                        callout={this.props.callout.callout}
                    />
                ) : null}
                {this.isSelected() ? (
                    <CalloutTransformComponent
                        selectedShape={this}
                        tool={tool}
                    />
                ) : null}
            </>
        );
    }
}
