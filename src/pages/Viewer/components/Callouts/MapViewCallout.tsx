import React from "react";
import { HOTSPOTS } from "../../../../constants";
import MapViewRectCallout from "./MapViewRectCallout";
import MapViewPolygonCallout from "./MapViewPolygonCallout";
import { Layer } from "konva/types/Layer";
import { ICalloutObject } from "../../../../components/callouts/callouts.interfaces";

interface IMapViewCalloutProps {
    activeFloor: number;
    callout: ICalloutObject;
    imageHeight: number;
    imageWidth: number;
    imageLayer: Layer;
}

const MapViewCallout = (props: IMapViewCalloutProps) => {
    const { callout } = props;
    if (props.activeFloor === callout.floor) {
        if (callout.shape.type === HOTSPOTS.RECTANGLE) {
            return <MapViewRectCallout {...props} />;
        } else if (callout.shape.type === HOTSPOTS.POLYGON) {
            return <MapViewPolygonCallout {...props} />;
        }
    }
    return null;
};

export default MapViewCallout;
