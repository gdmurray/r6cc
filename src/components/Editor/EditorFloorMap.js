import React, { Component } from "react";
import PropTypes from 'prop-types';
import TransformerComponent from "./TransformerComponent";
import EditCalloutDialog from "../../containers/Editor/EditCalloutDialog";
import EditableHotSpotComponent from "../Editor/EditableHotSpotComponent";
import { Stage, Layer, Rect, Text, Group, Line } from "react-konva";
import { makeid } from "../../utils";
import { KEYCODES, TOOLS, HOTSPOTS, MAP_WIDTH, MAP_HEIGHT, EDIT_CALLOUTS_EVENT } from "../../constants";
import FloorImage from "../Maps/FloorImage";

let _chunk = require("lodash/chunk");
let _sortBy = require("lodash/sortBy");

class EditorFloorMap extends Component {

    constructor(props) {
        super(props);
        this.state = {
            stageWidth: window.innerWidth,
            stageScale: 1,
            stageX: 0,
            stageY: 0,

            floorCallouts: [],

            imageWidth: null,
            imageHeight: null,

            _point: null,
            _absPoint: null,
            _stageSize: null,
            _canvasDims: null,
            _imageLayerCanvasDims: null,
            _imageDims: null,
            _translatedPoint: null,

            newRect: [],
            newPoly: [],
            editModalOpen: false,
            selectedId: null,
            selectedShape: null,
            editCalloutId: null,
            pointTransformId: null,
        }
    }

    componentDidMount() {
        window.addEventListener("resize", this.checkParentSize);
        document.addEventListener("keydown", this._handleKeyDown);
        this.checkParentSize();
        //this.loadCallouts();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.checkParentSize);
        document.removeEventListener("keydown", this._handleKeyDown);
    }
    
    componentWillReceiveProps(props) {
        if (this.props.callouts.length !== props.callouts.length || this.state.floorCallouts.length === 0) {
            // Callouts Changed
            this.setState({
                floorCallouts: props.callouts
            });
        }

        //On ToolChange
        if (this.state.pointTransformId !== null) {
            if (!props.editMode || props.tool !== TOOLS.POINT_TRANSFORM) {
                console.log("Tool Change");
                this.resetSelection();
                this.props.selectedIdCallback(null);
            }
        }

        if (this.state.selectedId !== null) {
            if (!props.editMode || props.tool !== TOOLS.TRANSFORM) {
                this.resetSelection();
                this.props.selectedIdCallback(null);
            }
        }

        if (props.calloutDeleted !== false){
            this.setState(prevState => ({
                floorCallouts: prevState.floorCallouts.filter(el => el.id !== props.calloutDeleted)
            }))
            props.deletedCalloutCallback(props.calloutDeleted);
        }
    }

    _handleKeyDown = event => {
        //event.preventDefault();
        switch (event.keyCode) {
            case KEYCODES.ENTER:
                event.preventDefault();
                if (this.props.tool === TOOLS.POLYGON && this.props.editMode) {
                    if (this._drawing) {
                        console.log("finished drawing");
                        this._drawing = false;
                        var { newPoly, floorCallouts } = this.state;
                        var points = [];
                        _chunk(newPoly, 2).forEach((pair, index) => {
                            var { x, y } = this.convertToImageSize(pair[0], pair[1]);
                            points.push(x, y);
                        });

                        var tmpId = `tmp-${makeid(8)}`;
                        var polyObject = {
                            id: tmpId,
                            callout: "",
                            callout_alt: "",
                            map: this.props.map,
                            floor: this.props.activeFloor,
                            order: 0,
                            shape: {
                                type: HOTSPOTS.POLYGON,
                                values: points
                            }
                        }
                        this.props.insertCalloutCallback(polyObject);
                        this.setState({
                            newPoly: [],
                            floorCallouts: floorCallouts.concat(polyObject),
                        })

                    }
                }
                return
            case 192:
                console.log("DEBUG");
                console.log(this.state.floorCallouts);
                return
            default:
                return true;
        }

    }
    handleWheel = e => {
        /*
          Handles Scaling on scroll
        */
        e.evt.preventDefault();

        //Scale Factor (only change by 0.0X)
        const scaleBy = 1.04;
        const stage = e.target.getStage();
        const oldScale = stage.scaleX();
        const mousePointTo = {
            x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
            y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
        };

        const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

        stage.scale({ x: newScale, y: newScale });

        this.setState({
            stageScale: newScale,
            stageX:
                -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
            stageY:
                -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
        });
    };

    getAbsolutePosition = () => {
        /*
            Gets Position of mouse on canvas
        */
        const stage = this.stageRef.getStage();
        const point = stage.getPointerPosition();
        var transform = this.layerRef.getAbsoluteTransform().copy();
        transform.invert();
        var absPos = transform.point(point);
        return absPos;
    }

    getTranslatedPosition = () => {
        /*
            Translates the position of the cursor to its x,y coordinates on the map
        */
        var absPos = this.getAbsolutePosition();
        var imageLayer = this.layerRef.getLayer();
        const image = imageLayer.children[0];
        const imageWidth = image.getAttr("width");
        const imageHeight = image.getAttr("height");
        const newX = (absPos.x / imageWidth) * 2560;
        const newY = (absPos.y / imageHeight) * 1440;
        return { x: newX, y: newY }
    }

    convertToImageSize = (x, y, w = false, h = false) => {
        /*
          Converts from Current Image Size to Total Image Size
          ie (currentX / currentHeight) * NEW_DIMENSION
        */
        var imageLayer = this.layerRef.getLayer();
        const image = imageLayer.children[0];
        const imageWidth = image.getAttr("width");
        const imageHeight = image.getAttr("height");
        var newX = (x / imageWidth) * MAP_WIDTH;
        var newY = (y / imageHeight) * MAP_HEIGHT;
        var newW = w ? (w / imageWidth) * MAP_WIDTH : w;
        var newH = h ? (h / imageHeight) * MAP_HEIGHT : h;
        return { x: newX, y: newY, w: newW, h: newH }
    }

    handleMouseDown = e => {
        if (this.props.editMode) {
            //Rectangle Drawing Tool
            if (this.props.tool === TOOLS.RECTANGLE) {
                this._drawing = true;
                let absPos = this.getAbsolutePosition()
                this.setState({
                    newRect: [{ x: absPos.x, y: absPos.y, w: 1, h: 1 }]
                });
                //Points Drawing Tool
            } else if (this.props.tool === TOOLS.POLYGON) {
                if (!this._drawing) {
                    // New Polygon being Drawn, set drawing to true
                    this._drawing = true;
                }
                const { newPoly } = this.state;
                let absPos = this.getAbsolutePosition();
                var points = [absPos.x, absPos.y]

                this.setState({
                    newPoly: newPoly.concat(points)
                })
                if (newPoly.length >= 2) {
                    var originalX = newPoly[0];
                    var originalY = newPoly[1];
                    const dist = Math.sqrt((absPos.x - originalX) ** 2 + (absPos.y - originalY) ** 2);
                    console.log(dist);
                }

                //Transform Shape Tool
            } else if (this.props.tool === TOOLS.TRANSFORM) {
                // Unselect Shape if background Image is Clicked
                const { clickStartShape } = e.currentTarget;
                if (clickStartShape.attrs.name) {
                    if (clickStartShape.attrs.name === "mapImg") {
                        this.setState({
                            selectedShape: null,
                            selectedId: null,
                        });
                        this.props.selectedIdCallback(null);
                    }
                }
            }
        }
    }

    resetSelection = () => {
        this.setState({
            selectedShape: null,
            selectedId: null,
            pointTransformId: null,
            editCalloutId: null
        })
    }

    selectShape = (shape) => {
        console.log("SHAPE SELECTED: ", shape);
        if (this.props.editMode && this.props.tool === TOOLS.TRANSFORM) {
            this.setState({
                selectedShape: shape,
                selectedId: shape.id,
            })
            this.props.selectedIdCallback(shape.id);
        } else if (this.props.editMode && this.props.tool === TOOLS.POINT_TRANSFORM) {
            this.setState({
                pointTransformId: shape.id,
            })
            this.props.selectedIdCallback(shape.id);
        } else if (this.props.editMode && this.props.tool === TOOLS.EDIT) {
            //console.log(shape.id);
            if (this.state.editCalloutId !== shape.id) {
                //console.log("Opening Edit Modal");
                this.setState({
                    editCalloutId: shape.id,
                    editModalOpen: true
                })
            }
        }
    }


    handleMouseMove = e => {
        if (!this._drawing) {
            return;
        }

        if (this.props.editMode) {
            if (this.props.tool === TOOLS.RECTANGLE) {
                const stage = this.stageRef.getStage();
                const point = stage.getPointerPosition();
                const { newRect } = this.state;
                var rect = newRect[0];
                var transform = this.layerRef.getAbsoluteTransform().copy();
                transform.invert();
                var absPos = transform.point(point);

                var newHeight = absPos.y - rect.y;
                var newWidth = absPos.x - rect.x;
                rect.w = newWidth;
                rect.h = newHeight;
                this.setState({
                    newRect: [rect]
                })
            }
        }
    }

    handleMouseUp = () => {
        /*
            When the editor is done creating the rectangle
            - Generates Id, adds to callouts list
            - Inserts new callout to save list for db insert
        */
        if (this.props.editMode) {
            if (this.props.tool === TOOLS.RECTANGLE) {
                console.log("STOPPED DRAWING RECTANGLE");
                this._drawing = false;
                var { newRect, floorCallouts } = this.state;
                var rect = newRect.pop();
                console.log(rect);
                var { x, y, w, h } = rect;
                console.log(x, y, w, h);
                var { x, y, w, h } = this.convertToImageSize(x, y, w, h);
                console.log(w, y, w, h);
                var tmpId = `tmp-${makeid(8)}`;
                var rectObject = {
                    id: tmpId,
                    callout: "",
                    callout_alt: "",
                    map: this.props.map,
                    floor: this.props.activeFloor,
                    order: 0,
                    shape: {
                        type: HOTSPOTS.RECTANGLE,
                        values: [x, y, w, h]
                    }
                }
                this.props.insertCalloutCallback(rectObject);
                this.setState({
                    newRect: [],
                    floorCallouts: floorCallouts.concat(rectObject),
                })
            }
        }
    };


    checkParentSize = () => {
        const layer = this.layerRef.getLayer();
        const image = layer.children[0];
        const width = image.getAttr("width");
        const height = image.getAttr("height");
        this.setState({
            stageWidth: window.innerWidth,
            imageWidth: width,
            imageHeight: height
        })
    };

    imageLoadedCallback = () => {
        this.checkParentSize();
    }

    handleMouseOver = () => {
        const stage = this.stageRef.getStage();
        const point = stage.getPointerPosition();
        var transform = this.layerRef.getAbsoluteTransform().copy();
        transform.invert();
        var absPos = transform.point(point);

        const layer = this.layerRef.getLayer();
        const stageSize = stage.getSize();
        const canvas = layer.getCanvas();
        const shapeLayer = this.shapeLayerRef.getLayer();
        const image = layer.children[0];
        const imageObj = this.imageObj;
        const originalImage = imageObj.getImage();
        const imageWidth = image.getAttr("width");
        const imageHeight = image.getAttr("height");
        const newX = (absPos.x / imageWidth) * originalImage.width;
        const newY = (absPos.y / imageHeight) * originalImage.height;
        //console.log(this.)
        //console.log(originalImage);
        //console.log(layer);
        this.setState({
            _point: `x: ${Math.round(point.x)} y: ${Math.round(point.y)}`,
            _absPoint: `x: ${Math.round(absPos.x)} y: ${Math.round(absPos.y)}`,
            _stageSize: `Stage: w: ${Math.round(stageSize.width)} h: ${Math.round(stageSize.height)}`,
            _imageLayerCanvasDims: `Img Layer: ${Math.round(canvas.width)}, ${Math.round(canvas.height)}`,
            _imageDims: `Img: ${image.getAttr("width")} ${image.getAttr("height")}`,
            _translatedPoint: `x: ${Math.round(newX)} y: ${Math.round(newY)}`
        })

    }

    drawActivePoly = () => {
        if (this._drawing) {
            const { newPoly } = this.state;
            return (
                <Line
                    key={`poly-0`}
                    points={newPoly}
                    fill={"red"}
                    stroke={"black"}
                    strokeWidth={1}
                    opacity={0.5}
                    closed={true}
                />
            )
        }
    }

    closeModalCallback = (event) => {
        switch (event){
            case EDIT_CALLOUTS_EVENT.CANCEL:
                console.log("CANCELLED");
                this.setState({
                    editModalOpen: false,
                    editCalloutId: null
                })
                break;
            case EDIT_CALLOUTS_EVENT.SAVE:
            case EDIT_CALLOUTS_EVENT.DELETE:
                this.setState({
                    editModalOpen: false,
                    editCalloutId: null
                })
                this.props.getCalloutsCallback();
                break;
            default:
                break;
        }
        
    }

    render() {
        var {floorCallouts} = this.state;
        console.log(floorCallouts);
        var callouts = _sortBy(floorCallouts, ['order'], ['asc']);
        console.log(callouts);
        return (
            <div ref={node => {
                this.container = node;
            }} className={this.props.editMode ? 'edit-mode' : ''}>
                <Stage
                    ref={node => {
                        this.stageRef = node;
                    }}
                    width={window.innerWidth}
                    height={window.innerHeight}
                    onWheel={this.handleWheel}
                    scaleX={this.state.stageScale}
                    scaleY={this.state.stageScale}
                    x={this.state.stageX}
                    y={this.state.stageY}
                    onContentMousedown={this.handleMouseDown}
                    onContentMousemove={this.handleMouseMove}
                    onContentMouseup={this.handleMouseUp}
                    draggable={!this.props.editMode}

                //onMouseMove={this.handleMouseOver}  
                >
                    <Layer ref={node => { this.layerRef = node }}>
                        <FloorImage ref={node => { this.imageObj = node }}
                            map={this.props.map}
                            floor={this.props.activeFloor}
                            canvasWidth={this.state.stageWidth}
                            imageLoadedCallback={this.imageLoadedCallback} />
                    </Layer>
                    <Layer ref={node => { this.shapeLayerRef = node }} >
                        {this.state.newRect.map((shape, index) => {
                            if (this._drawing) {
                                return (
                                    <Rect
                                        key={`rect-${index}`}
                                        x={shape.x}
                                        y={shape.y}
                                        width={shape.w}
                                        height={shape.h}
                                        fill="red"
                                        opacity={0.5}
                                    />
                                );
                            }
                        })}
                        {this.drawActivePoly()}
                        <Group>
                            {callouts.map((shape, index) => {
                                console.log(shape.id);
                                return (
                                    <EditableHotSpotComponent
                                        pointTransformId={this.state.pointTransformId}
                                        activeFloor={this.props.activeFloor}
                                        imageWidth={this.state.imageWidth}
                                        imageHeight={this.state.imageHeight}
                                        imageLayer={this.layerRef}
                                        onSelect={this.selectShape} key={index}
                                        selectedForEdit={this.state.editCalloutId}
                                        selected={this.state.selectedId} {...shape}
                                        updateCallout={this.props.updateCalloutCallback} />


                                );
                            })}
                            <TransformerComponent selectedShape={this.state.selectedShape} />
                        </Group>
                    </Layer>
                </Stage>
                <EditCalloutDialog
                        callouts={this.state.floorCallouts}
                        editModalOpen={this.state.editModalOpen}
                        selectedId={this.state.editCalloutId}
                        onClose={this.closeModalCallback}
                />
            </div>
        )
    }
}

export default EditorFloorMap;