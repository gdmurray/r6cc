import { createContainer } from "unstated-next";
import { useState } from "react";

function useMapStore() {
    const [map, setMap] = useState();
    const [floor, setFloor] = useState();
    return {
        map,
        setMap,
        floor,
        setFloor,
    };
}

export default createContainer(useMapStore);
