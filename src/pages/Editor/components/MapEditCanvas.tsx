import React from "react";
import BaseMapView, {
    BaseMapProps,
    BaseMapState,
    PolyValues,
    RectObject,
} from "../../../components/maps/BaseMapView";
import { Group, Layer, Line, Rect, Stage } from "react-konva";
import FloorImageV2 from "../../../components/maps/FloorImageV2";
import { TOOLS } from "../../../constants";
import { makeid } from "../../../utils";
import { subscribeToContainers } from "unstated-next-subscribe";
import EditorStore from "../store/EditorStore";
import MapEditCallout from "./Callouts/MapEditCallout";
import MapEditRectCallout from "./Callouts/MapEditRectCallout";
import MapEditPolygonCallout from "./Callouts/MapEditPolygonCallout";
import { Button } from "antd";
import DetailDrawer from "./Sidebar/DetailDrawer";
import { ICalloutActions } from "./MapEditor";
import { MenuOutlined } from "@ant-design/icons";
import Konva from "konva";
import CalculatedText from "../../../components/callouts/CalculatedText";

let _chunk = require("lodash/chunk");
let _sortBy = require("lodash/sortBy");
let _isEqual = require("lodash/isEqual");
let _reduce = require("lodash/reduce");

interface MapEditCanvasState extends BaseMapState {
    newRect: RectObject | undefined;
    newPoly: PolyValues | undefined;
    editModalOpen: boolean;
    hoveredShapeId: any;
    editCalloutId: any;
    sideBarOpen: boolean;
}

interface MapEditCanvasProps extends BaseMapProps, ICalloutActions {
    store: any;
    editorContainer: React.RefObject<HTMLElement>;

    moveFloor(direction: number): void;

    calloutActions: ICalloutActions;
}

class MapEditCanvas extends BaseMapView<
    MapEditCanvasProps,
    MapEditCanvasState
> {
    public _drawing: boolean;
    public lineRef: React.RefObject<Konva.Line>;

    getInitialState(): MapEditCanvasState {
        const initialState = super.getInitialState();

        return {
            ...initialState,
            newRect: undefined,
            newPoly: undefined,
            editModalOpen: false,
            hoveredShapeId: null,
            editCalloutId: null,
            sideBarOpen: false,
        };
    }

    constructor(props) {
        super(props);
        this.lineRef = React.createRef();
        this._drawing = false;
    }

    componentWillReceiveProps(nextProps: Readonly<any>, nextContext: any) {
        const changedProps = _reduce(
            this.props,
            function (result, value, key) {
                return _isEqual(value, nextProps[key])
                    ? result
                    : result.concat(key);
            },
            []
        );
        const ignored = ["calloutActions", "moveFloor", "store"];
        changedProps.forEach((elem) => {
            if (
                typeof nextProps[elem] !== "function" &&
                ignored.indexOf(elem) === -1
            ) {
                console.log(elem, nextProps[elem]);
            }
        });
    }

    componentDidMount() {
        document.addEventListener("keydown", this._handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this._handleKeyDown);
    }

    /**
     * If the tool or edit mode changes while canvas is drawing, cancel that drawing
     * @param prevProps
     * @param prevState
     */
    componentDidUpdate(
        prevProps: Readonly<MapEditCanvasProps>,
        prevState: Readonly<MapEditCanvasState>
    ) {
        if (
            this.props.store.tool !== prevProps.store.tool ||
            this.props.store.edit !== prevProps.store.edit
        ) {
            this._drawing = false;
            if (this.state.newPoly) {
                this.setState({
                    newPoly: undefined,
                });
            }
        }
    }

    imageLoadedCallback = () => {
        console.log("Image Loaded");
    };

    /**
     * Handles the key down event for the canvas
     * Specifically handles the Enter key press, which completes the poly draw object
     * @param event
     */
    _handleKeyDown = (event) => {
        switch (event.code) {
            // When enter is pressed when drawing a polygon callout
            case "Enter":
                const { tool, edit } = this.props.store;
                if (this._drawing && edit && tool === TOOLS.POLYGON) {
                    this._drawing = false;
                    const { newPoly } = this.state;
                    const polyShape = this.lineRef.current;
                    if (newPoly && polyShape) {
                        const { points } = newPoly;
                        let newPoints: number[] = [];
                        _chunk(points, 2).forEach((pair) => {
                            const [pairX, pairY] = pair;
                            let { x, y } = this.convertToImageSize(
                                pairX,
                                pairY,
                                0,
                                0
                            );
                            newPoints.push(x, y);
                        });

                        const [x, y] = [polyShape.x(), polyShape.y()];
                        const polyObject = this.createNewPolygon(
                            x,
                            y,
                            newPoints
                        );
                        this.props.calloutActions.create(polyObject);
                    }
                }

                return true;
            default:
                return true;
        }
    };

    /**
     * Handles the Mousedown event for the canvas
     * Starts drawing the shape depending on the selected tool (either polygon or rect)
     * @param currentTarget {Konva.Stage} The stage element being clicked
     */
    handleMouseDown = ({ currentTarget }: { currentTarget: Konva.Stage }) => {
        /*
            Handles the click event
         */
        const { edit, tool, setSelectedShape } = this.props.store;
        if (edit) {
            // Start drawing if in rectangle mode
            if (tool === TOOLS.RECTANGLE || tool === TOOLS.FOCAL) {
                // Set Drawing active and get absolute position
                this._drawing = true;
                let absPos = this.getAbsolutePosition();
                // Instantiate Rectangle with default width and height of 1 and 1
                this.setState({
                    newRect: { x: absPos.x, y: absPos.y, w: 1, h: 1 },
                });
            } else if (tool === TOOLS.POLYGON) {
                if (!this._drawing) {
                    this._drawing = true;
                }
                const { newPoly } = this.state;
                let absPos = this.getAbsolutePosition();
                let points = [absPos.x, absPos.y];
                if (newPoly) {
                    this.setState(
                        {
                            newPoly: {
                                ...newPoly,
                                points: newPoly.points.concat(points),
                            },
                        },
                        () => {
                            console.log(this.state.newPoly);
                        }
                    );
                } else {
                    this.setState({
                        newPoly: {
                            x: -1,
                            y: -1,
                            points,
                        },
                    });
                }
            } else if (
                // If in any of the transform modes, set shape as selected.
                tool === TOOLS.TRANSFORM ||
                tool == TOOLS.POINT_TRANSFORM ||
                tool == TOOLS.EDIT
            ) {
                // If user is clicking on the map image, deselect current selected
                if ("clickStartShape" in currentTarget) {
                    const { clickStartShape } = currentTarget;
                    if ("name" in clickStartShape.attrs) {
                        if (clickStartShape.attrs.name === "mapImg") {
                            setSelectedShape(null);
                        }
                    }
                }
            }
        }
    };

    /**
     * Handles the mouse move, specifically for drawing rectangle (shape or focal)
     */
    handleMouseMove = () => {
        if (!this._drawing) {
            return;
        }
        const { edit, tool } = this.props.store;
        if (edit) {
            if (tool === TOOLS.RECTANGLE || tool === TOOLS.FOCAL) {
                const stageRef = this.stageRef.current;
                const layerRef = this.layerRef.current;
                if (stageRef && layerRef) {
                    const stage = stageRef.getStage();
                    const point = stage.getPointerPosition();

                    // get start point from state
                    let { newRect } = this.state;
                    if (newRect) {
                        let transform = layerRef.getAbsoluteTransform().copy();
                        transform.invert();
                        const absPos = transform.point(point);

                        newRect.w = absPos.x - newRect.x;
                        newRect.h = absPos.y - newRect.y;
                        this.setState({
                            newRect,
                        });
                    }
                }
            }
        }
    };

    /**
     *  When the editor is done creating the rectangle
     - Generates Id, adds to callouts list
     - Inserts new callout to save list for db insert
     - Starts creating either a callout rect or a focal point rect
     */
    handleMouseUp = () => {
        const { edit, tool } = this.props.store;
        if (edit) {
            if (tool === TOOLS.RECTANGLE || tool === TOOLS.FOCAL) {
                this._drawing = false;
                const { newRect } = this.state;
                if (newRect) {
                    const { x, y, w, h } = this.convertToImageSize(
                        newRect.x,
                        newRect.y,
                        newRect.w,
                        newRect.h
                    );

                    const rectObject = this.createNewRect([x, y, w, h]);
                    if (tool === TOOLS.RECTANGLE) {
                        this.props.calloutActions.create(rectObject);
                    } else {
                        console.log("Focal Point set...");
                        console.log(rectObject);
                    }

                    this.setState({
                        newRect: undefined,
                    });
                }
            }
        }
    };

    toggleDrawer = () => {
        this.setState({
            sideBarOpen: !this.state.sideBarOpen,
        });
    };

    // this.sizeInterval = setInterval(() => {
    //     this.checkParentSize();
    // }, 750);
    // clearInterval(this.sizeInterval)
    // checkParentSize = () => {
    //     const layer = this.layerRef.getLayer();
    //     const image = layer.children[0];
    //     console.log(image);
    //     const width = image.getAttr("width");
    //     const height = image.getAttr("height");
    //     const { stageWidth, imageWidth, imageHeight } = this.state;
    //     if (
    //         stageWidth !== window.innerWidth ||
    //         imageWidth !== width ||
    //         imageHeight !== height
    //     ) {
    //         console.log("window changed");
    //         this.setState({
    //             stageWidth: window.innerWidth,
    //             imageWidth: width,
    //             imageHeight: height,
    //         });
    //     }
    // };

    /**
     * Draws the active rectangle or focal point
     */
    drawActiveRect = () => {
        const { newRect } = this.state;
        if (newRect && this._drawing) {
            const { tool } = this.props.store;
            const { x, y, w, h } = newRect;
            if (tool === TOOLS.RECTANGLE) {
                return (
                    <Rect
                        x={x}
                        y={y}
                        width={w}
                        height={h}
                        fill="red"
                        opacity={0.5}
                    />
                );
            } else if (tool === TOOLS.FOCAL) {
                return (
                    <Group>
                        <Rect
                            x={x}
                            y={y}
                            width={w}
                            height={h}
                            fillEnabled={false}
                            strokeEnabled
                            stroke="red"
                            strokeWidth={2}
                        />
                        <Line
                            points={[x, y, x + w, y + h]}
                            stroke={"red"}
                            width={2}
                        />
                        <Line
                            points={[x, y + h, x + w, y]}
                            stroke={"red"}
                            width={2}
                        />
                    </Group>
                );
            }
        }
        return;
    };

    /**
     * Draws Polygon currently being created
     */
    drawActivePoly = () => {
        if (this._drawing) {
            const { newPoly } = this.state;
            if (newPoly) {
                const { points } = newPoly;
                return (
                    <Line
                        ref={this.lineRef}
                        key={`poly-0`}
                        points={points}
                        fill={"red"}
                        stroke={"black"}
                        strokeWidth={1}
                        opacity={0.5}
                        closed={true}
                    />
                );
            }
        }
        return null;
    };

    /**
     * Callback which handles the selection of a shape
     * Will open the editor sidebar if Edit Callout is selected
     * @param shape {MapEditRectCallout | MapEditPolygonCallout | CalculatedText} The currently selected text
     */
    handleShapeSelect = (
        shape: MapEditRectCallout | MapEditPolygonCallout | CalculatedText
    ) => {
        const { edit, tool, setSelectedShape } = this.props.store;
        if (edit) {
            // Regular selection of transform or point transform (polygon)
            if (tool === TOOLS.TRANSFORM || tool === TOOLS.POINT_TRANSFORM) {
                setSelectedShape(shape);
            }
            // If edit callout is selected, open up sidebar to callout
            else if (tool === TOOLS.EDIT) {
                setSelectedShape(shape);
                if (!this.state.sideBarOpen) {
                    this.setState({
                        sideBarOpen: true,
                    });
                }
            }
        }
    };

    getDrawerSelectedShape = ():
        | MapEditRectCallout
        | MapEditPolygonCallout
        | null => {
        const { tool, selectedShape } = this.props.store;
        if (tool === TOOLS.EDIT && selectedShape) {
            return selectedShape;
        }
        return null;
    };

    handleClick = () => {
        const stageRef = this.stageRef.current;

        if (stageRef) {
            const stage = stageRef.getStage();
            console.log(stage.getPointerPosition());
            console.log(this.getTranslatedPosition());
        }
    };

    render() {
        const { edit, tool } = this.props.store;
        let { activeCallouts } = this.props;
        let callouts = _sortBy(activeCallouts, ["order"], ["asc"]);
        const imageObj = this.imageObj.current;
        const imgWidth = imageObj ? imageObj.state.width : 1440; // todo: set some appropriate defaults here
        const imgHeight = imageObj ? imageObj.state.height : 1000;
        return (
            <div className={edit ? "edit-mode" : ""}>
                <Button
                    shape="circle"
                    className="edit-panel-button"
                    icon={<MenuOutlined />}
                    onClick={() =>
                        this.setState({ sideBarOpen: !this.state.sideBarOpen })
                    }
                />
                <DetailDrawer
                    open={this.state.sideBarOpen}
                    callouts={[...this.props.activeCallouts]}
                    selectedShape={this.getDrawerSelectedShape()}
                    map={this.props.map}
                    floor={this.props.activeFloor}
                    store={this.props.store}
                    calloutActions={this.props.calloutActions}
                    handleShapeSelect={this.handleShapeSelect}
                    toggleDrawer={this.toggleDrawer}
                    moveFloor={this.props.moveFloor}
                />
                <Stage
                    ref={this.stageRef}
                    width={window.innerWidth}
                    height={this.getInnerHeight()}
                    onWheel={this.handleScrollWheel}
                    scaleX={this.state.stageScale}
                    scaleY={this.state.stageScale}
                    x={this.state.stageX}
                    y={this.state.stageY}
                    draggable={!edit}
                    onContentClick={this.handleClick}
                    onContentMousedown={this.handleMouseDown}
                    onContentMousemove={this.handleMouseMove}
                    onContentMouseup={this.handleMouseUp}
                >
                    <Layer ref={this.layerRef} name="floorLayer">
                        <FloorImageV2
                            ref={this.imageObj}
                            map={this.props.map}
                            floor={this.props.activeFloor}
                            canvasWidth={this.state.stageWidth}
                            imageLoadedCallback={this.imageLoadedCallback}
                        />
                    </Layer>
                    <Layer name="shapeLayer">
                        {this.drawActiveRect()}
                        {this.drawActivePoly()}

                        {callouts.map((shape) => {
                            return (
                                <Group key={shape.id}>
                                    <MapEditCallout
                                        activeFloor={this.props.activeFloor}
                                        imageWidth={imgWidth}
                                        imageHeight={imgHeight}
                                        imageLayer={this.layerRef}
                                        // key={shape.id}
                                        callout={shape}
                                        visibleText={
                                            this.props.store.visibleText
                                        }
                                        hoveredShapeId={
                                            this.props.store.hoveredShapeId
                                        }
                                        selectedShape={
                                            this.props.store.selectedShape
                                        }
                                        calloutActions={
                                            this.props.calloutActions
                                        }
                                        tool={tool}
                                        onSelect={this.handleShapeSelect}
                                    />
                                </Group>
                            );
                        })}
                    </Layer>
                </Stage>
            </div>
        );
    }
}

export default subscribeToContainers({ store: EditorStore })(MapEditCanvas);
