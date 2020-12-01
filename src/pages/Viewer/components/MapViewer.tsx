import React, { useEffect, useState } from "react";
import MapViewCanvas from "./MapViewCanvas";
import { MapMode, SiegeMap } from "../../../components/maps/BaseMapView";
import { ICalloutObject } from "../../../components/callouts/callouts.interfaces";

interface IMapViewerProps {
    callouts: ICalloutObject[];
    map: SiegeMap;
    loading: boolean;

    getCallouts(map: string, floor: number): void;
}

const MapViewer = (props: IMapViewerProps): JSX.Element => {
    const [calloutCache, setCalloutCache] = useState<
        Record<number, { fetches: number; data: ICalloutObject[] }>
    >({});
    const [activeFloor, setActiveFloor] = useState<number>(0);
    const [activeCallouts, setActiveCallouts] = useState<ICalloutObject[]>([]);

    // On Mount UseEffect --> Preload images
    // useEffect(() => {
    //     console.log(props.map);
    //     const preloadImages = async (siegeMap: SiegeMap) => {
    //         const { short_code } = siegeMap;
    //         const promises = await siegeMap.floors.map((floor) => {
    //             return new Promise(function (resolve, reject) {
    //                 const img = new Image();
    //                 img.src =
    //                     process.env.PUBLIC_URL +
    //                     `/img/maps/${short_code}/${short_code}-${floor.position}.png`;
    //                 img.onload = resolve();
    //                 img.onerror = reject();
    //             });
    //         });
    //         await Promise.all(promises)
    //     };
    // }, []);

    // KeyPress Handler useEffect
    const _handleKeyDown = (event: KeyboardEvent) => {
        switch (event.code) {
            case "ArrowUp":
                event.preventDefault();
                const { map } = props;
                if (activeFloor < map.floors.length - 1) {
                    setActiveFloor(activeFloor + 1);
                }
                return;
            case "ArrowDown":
                event.preventDefault();
                if (activeFloor > 0) {
                    setActiveFloor(activeFloor - 1);
                }
                return;
            default:
                return true;
        }
    };

    useEffect(() => {
        document.addEventListener("keydown", _handleKeyDown);
        return () => {
            document.removeEventListener("keydown", _handleKeyDown);
        };
    }, [_handleKeyDown]);

    // Fetch Callouts on Floor Change... use cache
    useEffect(() => {
        const { map } = props;
        if (activeFloor in calloutCache) {
            console.log(calloutCache[activeFloor]);
            // If its been fetched more than twice or has data... use cache
            if (
                calloutCache[activeFloor].fetches > 2 ||
                calloutCache[activeFloor].data.length > 0
            ) {
                setActiveCallouts(calloutCache[activeFloor].data);
            } else {
                props.getCallouts(map.short_code, activeFloor);
            }
        } else {
            props.getCallouts(map.short_code, activeFloor);
        }
    }, [activeFloor]);

    // Set active callouts on change from db check
    // Every time a floor receives props... increment fetches for that floor.
    useEffect(() => {
        // console.log("Received Callouts from props: ", props.callouts);
        // Active floor doesnt exist in cache
        if (!(activeFloor in calloutCache)) {
            const newCache = calloutCache;
            newCache[activeFloor] = {
                fetches: 1,
                data: props.callouts,
            };
            setCalloutCache({ ...calloutCache, ...newCache });
        } else {
            calloutCache[activeFloor].fetches += 1;
            calloutCache[activeFloor].data = props.callouts;
            setCalloutCache(calloutCache);
        }

        setActiveCallouts(props.callouts);
    }, [props.callouts]);

    return (
        <div>
            <MapViewCanvas
                {...props}
                mode={MapMode.VIEWER}
                activeFloor={activeFloor}
                activeCallouts={activeCallouts}
            />
        </div>
    );
};

export default MapViewer;
