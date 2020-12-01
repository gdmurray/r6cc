import { HOTSPOTS } from "../../../../constants";
import MapEditRectCallout, {
    MapEditRectHotspotProps,
} from "./MapEditRectCallout";
import React from "react";
import MapEditPolygonCallout, {
    MapEditPolygonHotspotProps,
} from "./MapEditPolygonCallout";

const MapEditCallout = (props) => {
    if (props.activeFloor === props.callout.floor) {
        if (props.callout.shape.type === HOTSPOTS.RECTANGLE) {
            return <MapEditRectCallout {...props} />;
        } else if (props.callout.shape.type === HOTSPOTS.POLYGON) {
            return <MapEditPolygonCallout {...props} />;
        }
    }
    return null;
};

export default MapEditCallout;
