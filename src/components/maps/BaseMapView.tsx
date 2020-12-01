import React from "react";
import { HOTSPOTS, MAP_HEIGHT, MAP_WIDTH, MENU_HEIGHT } from "../../constants";
import { Layer } from "konva/types/Layer";
import FloorImageV2 from "./FloorImageV2";
import { ICalloutObject } from "../callouts/callouts.interfaces";
import Konva from "konva";
import { makeid } from "../../utils";

export interface BaseMapState {
    stageHeight: number;
    stageWidth: number;
    stageScale: number;
    stageX: number;
    stageY: number;
}

export interface MapFloor {
    position: number;
    short_code: string;
    name: string;
}

export enum MapMode {
    EDITOR,
    VIEWER,
}

export interface SiegeMap {
    id: string;
    name: string;
    short_code: string;
    floors: MapFloor[];
}

export interface PolyValues {
    x: number;
    y: number;
    points: number[];
}

export interface PolyShape {
    type: string;
    values: PolyValues;
}

export interface PolyCallout extends ICalloutObject {
    order: number;
    shape: PolyShape;
}

export interface RectObject {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface RectShape {
    type: string;
    values: number[];
}

export interface RectCallout extends ICalloutObject {
    order: number;
    shape: RectShape;
}

export interface BaseMapProps {
    activeFloor: number;
    activeCallouts: any[];
    map: SiegeMap;
    mode: number;
}

declare global {
    interface Number {
        round(digits: number): number;
    }
}

export interface IPoint {
    x: number;
    y: number;
}

// eslint-disable-next-line
Number.prototype.round = function (digits: number): number {
    const divisor = Math.pow(10, digits);
    return Math.round((Number.EPSILON + this.valueOf()) * divisor) / divisor;
};

export interface Bounds {
    top: IPoint;
    right: IPoint;
    bottom: IPoint;
    left: IPoint;
}

/**
 @component
 */
class BaseMapView<
    P extends BaseMapProps,
    S extends BaseMapState
> extends React.Component<P, S> {
    public stageRef: React.RefObject<Konva.Stage>;
    public layerRef: React.RefObject<Layer>;
    public imageObj: React.RefObject<FloorImageV2>;

    constructor(props) {
        super(props);
        this.state = this.getInitialState();
        this.stageRef = React.createRef();
        this.layerRef = React.createRef();
        this.imageObj = React.createRef();
    }

    /**
     * returns the initial state
     @return {BaseMapState}
     */
    getInitialState(): S {
        return ({
            stageWidth: window.innerWidth,
            stageHeight: this.getInnerHeight(),
            stageScale: 1,
            stageX: 0,
            stageY: 0,
            floorCallouts: [],
        } as unknown) as S;
    }

    /**
     @return {boolean} Whether the map is in editor mode
     */
    isEditor = (): boolean => {
        return this.props.mode === MapMode.EDITOR;
    };

    /**
     @return {boolean} Whether the map is the viewer mode
     */
    isViewer = (): boolean => {
        return this.props.mode === MapMode.VIEWER;
    };

    /**
     Creates a New Polygon object with a generated id
     @param {number} x The X-Coordinate of the Polygon (default 0)
     @param {number} y The Y-Coordinate of the Polygon (default 0)
     @param {number[]} points The array of x,y coordinates for the polygon object.
     @return {PolyCallout} The callout object
     */
    createNewPolygon = (
        x: number,
        y: number,
        points: number[]
    ): PolyCallout => {
        const id = `tmp-${makeid(8)}`;
        const { map, activeFloor } = this.props;
        return {
            id,
            callout: "",
            callout_alt: "",
            map: map.short_code,
            floor: activeFloor,
            order: 0,
            shape: {
                type: HOTSPOTS.POLYGON,
                values: {
                    x,
                    y,
                    points,
                },
            },
        };
    };

    /**
     Creates a New Rect object with a generated id
     @param {number[]} values The array of x,y,w,h values for the rect object.
     @return {RectCallout} The callout object
     */
    createNewRect = (values: number[]): RectCallout => {
        const { map, activeFloor } = this.props;
        const id = `tmp-${makeid(8)}`;
        return {
            id,
            callout: "",
            callout_alt: "",
            map: map.short_code,
            floor: activeFloor,
            order: 0,
            shape: {
                type: HOTSPOTS.RECTANGLE,
                values,
            },
        };
    };

    /**
     @param x {number}
     @param y {number}
     @return {IPoint} Rounded Point
     */
    roundPoint = ({
        x,
        y,
    }: {
        x: number;
        y: number;
    }): { x: number; y: number } => {
        return {
            x: x.round(2),
            y: y.round(2),
        };
    };

    /**
     Returns the bounds for the image, and the current canvas position of those boundaries
     Used in scroll control in Viewer so the user cannot scroll out past the canvas
     @return {
            bounds: Bounds,
            canvasPos: Bounds,
            img: {width: number, height: number}
        }
     */
    evaluateBoundaries = (): {
        bounds: Bounds | undefined;
        canvasPos: Bounds | undefined;
        img: { width: number; height: number };
    } => {
        const imageObj = this.imageObj.current;
        const layerRef = this.layerRef.current;
        let imgWidth = MAP_WIDTH;
        let imgHeight = MAP_HEIGHT;
        if (imageObj && layerRef) {
            // Image Details
            const imageLayer = layerRef.getLayer();
            const image = imageLayer.children[0];
            imgWidth = image.getAttr("width");
            imgHeight = image.getAttr("height");
            const transform = layerRef.getAbsoluteTransform().copy();

            // Boundaries
            const bounds = {
                top: { x: Math.round(imgWidth / 2), y: 0 },
                right: {
                    x: imgWidth,
                    y: Math.round(imgHeight / 2),
                },
                bottom: {
                    x: Math.round(imgWidth / 2),
                    y: imgHeight,
                },
                left: { x: 0, y: Math.round(imgHeight / 2) },
            };

            const canvasPos = {
                top: this.roundPoint(transform.point(bounds.top)),
                right: this.roundPoint(transform.point(bounds.right)),
                bottom: this.roundPoint(transform.point(bounds.bottom)),
                left: this.roundPoint(transform.point(bounds.left)),
            };
            return {
                bounds,
                canvasPos,
                img: {
                    width: imgWidth.round(2),
                    height: imgHeight.round(2),
                },
            };
        }
        return {
            bounds: undefined,
            canvasPos: undefined,
            img: {
                width: MAP_WIDTH,
                height: MAP_HEIGHT,
            },
        };
    };

    /**
     @param {WheelEvent} e The scrollWheel event;
     */
    handleScrollWheel = (e) => {
        /*
          Handles Scaling on scroll
        */
        e.evt.preventDefault();

        //Scale Factor (only change by 0.0X)
        // todo: would be nice to have a smoother zoom, not so constant scale factor
        const scaleBy = 1.02;
        const stage = e.target.getStage();

        const oldScale = stage.scaleX();

        const mousePointTo = {
            x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
            y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
        };

        // To reverse scroll direction, change < to > in the newScale calculation;
        let newScale =
            e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

        let newStageX =
            -(mousePointTo.x - stage.getPointerPosition().x / newScale) *
            newScale;
        let newStageY =
            -(mousePointTo.y - stage.getPointerPosition().y / newScale) *
            newScale;

        // If Zooming out and is Viewer
        if (oldScale > newScale && this.isViewer() && newScale > 1) {
            /*
                This portion of the code is what
                prevents the user from zooming out into the white portion of the map
             */
            const { bounds, canvasPos, img } = this.evaluateBoundaries();
            if (bounds !== undefined && canvasPos !== undefined) {
                const scaledImgWidth = img.width * oldScale;
                const scaledWindowWidth = window.innerWidth - scaledImgWidth;

                const scaledImgHeight = img.height * oldScale;
                const scaledWindowHeight =
                    window.innerHeight - MENU_HEIGHT - scaledImgHeight;

                let debugX: string | undefined = undefined;
                let debugY: string | undefined = undefined;
                let overrideX: number | undefined = undefined;
                let overrideY: number | undefined = undefined;
                // TODO: Stop the jolting right on the Right Border override... maybe try and find a tolerance point to just set to stageX
                // Maybe dont set right unless it surpasses a certain threshold? Like 100px over?
                if (canvasPos.top.y >= bounds.top.y) {
                    overrideY = 0;
                    debugY = "TOP";
                }

                if (canvasPos.right.x <= bounds.right.x) {
                    console.log("Canvas: ", canvasPos.right.x);
                    console.log("Bounds: ", bounds.right.x);
                    overrideX = scaledWindowWidth;
                    debugX = "RIGHT";
                }
                if (canvasPos.bottom.y <= bounds.bottom.y) {
                    overrideY = scaledWindowHeight;
                    debugY = "BOTTOM";
                }
                if (canvasPos.left.x >= bounds.left.x) {
                    overrideX = 0;
                    debugX = "LEFT";
                }

                if (overrideX !== undefined || overrideY !== undefined) {
                    console.log(
                        "OVERRIDE: ",
                        debugX,
                        overrideX,
                        debugY,
                        overrideY
                    );
                    newScale = oldScale;
                    newStageX = overrideX !== undefined ? overrideX : stage.x();
                    newStageY = overrideY !== undefined ? overrideY : stage.y();
                }
            }
        }

        // Prevents zoom out on scale for viewer only
        if (newScale >= 1 || this.isEditor()) {
            stage.scale({ x: newScale, y: newScale });
            this.setState({
                stageScale: newScale,
                stageX: newStageX,
                stageY: newStageY,
            });
        }
    };

    convertPointToCanvasPosition = ({ x, y }: IPoint): IPoint => {
        /*
            Converts (x,y) coordinates from image into their respective location on the canvas.
         */
        const layerRef = this.layerRef.current;
        if (layerRef) {
            const transform = layerRef.getAbsoluteTransform().copy();
            return transform.point({ x, y });
        }
        return {
            x,
            y,
        };
    };

    getAbsolutePosition = () => {
        /*
            Gets Position of mouse on canvas
        */
        const stageRef = this.stageRef.current;
        const layerRef = this.layerRef.current;
        if (layerRef && stageRef) {
            const stage = stageRef.getStage();
            const point = stage.getPointerPosition();
            const transform = layerRef.getAbsoluteTransform().copy();
            transform.invert();
            let absPos = transform.point(point);
            return absPos;
        }
        return;
    };

    getTranslatedPosition = (): { x: number; y: number } => {
        /*
            Translates the absolute position of the mouse into the location on the image
         */
        const layerRef = this.layerRef.current;
        var absPos = this.getAbsolutePosition();
        if (layerRef) {
            var imageLayer = layerRef.getLayer();
            const image = imageLayer.children[0];
            const imageWidth = image.getAttr("width");
            const imageHeight = image.getAttr("height");
            const newX = (absPos.x / imageWidth) * 2560;
            const newY = (absPos.y / imageHeight) * 1440;
            return { x: newX.round(2), y: newY.round(2) };
        }
        return { x: absPos.x, y: absPos.y };
    };

    convertToImageSize = (x: number, y: number, w: number, h: number) => {
        /*
          Converts from Current Image Size to Total Image Size
          ie (currentX / currentHeight) * NEW_DIMENSION
        */
        const layerRef = this.layerRef.current;
        if (layerRef) {
            let imageLayer = layerRef.getLayer();
            const image = imageLayer.children[0];
            const imageWidth = image.getAttr("width");
            const imageHeight = image.getAttr("height");
            let newX = ((x / imageWidth) * MAP_WIDTH).round(2);
            let newY = ((y / imageHeight) * MAP_HEIGHT).round(2);
            let newW = (w ? (w / imageWidth) * MAP_WIDTH : w).round(2);
            let newH = (h ? (h / imageHeight) * MAP_HEIGHT : h).round(2);
            return { x: newX, y: newY, w: newW, h: newH };
        }
        return {
            x,
            y,
            w,
            h,
        };
    };

    getInnerHeight = (): number => {
        /*
            Returns the height of the canvas, accounts for the editor toolbar. (44px)
         */
        if (this.isEditor()) {
            return window.innerHeight - (MENU_HEIGHT + 44);
        }
        return window.innerHeight - MENU_HEIGHT;
    };
}

export default BaseMapView;
