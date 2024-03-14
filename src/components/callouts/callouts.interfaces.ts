import MapViewRectCallout from "../../pages/Viewer/components/Callouts/MapViewRectCallout";
import MapEditRectCallout from "../../pages/Editor/components/Callouts/MapEditRectCallout";
import MapViewPolygonCallout from "../../pages/Viewer/components/Callouts/MapViewPolygonCallout";
import MapEditPolygonCallout from "../../pages/Editor/components/Callouts/MapEditPolygonCallout";

export interface ICalloutObject {
    id: string;
    callout: string;
    callout_alt: string;
    shape: any;
    map: string;
    floor: number;
    order?: number;
}

export interface IBaseCalloutProps {
    activeFloor: number;
    imageWidth: number;
    imageHeight: number;
    callout: ICalloutObject;
}

export interface BasePolygonProps extends IBaseCalloutProps {}

export interface BasePolygonState {
    x: number;
    y: number;
    points: number[];
}

export interface BaseRectProps extends IBaseCalloutProps {}

export interface BaseRectState {
    x: number;
    y: number;
    h: number;
    w: number;
}

type TextParent =
    | MapViewRectCallout
    | MapEditRectCallout
    | MapViewPolygonCallout
    | MapEditPolygonCallout;

export interface ICalculatedTextProps {
    shape: BaseRectState;
    callout: string;
    parent: TextParent;

    onSelect(shape: TextParent): void;
}
