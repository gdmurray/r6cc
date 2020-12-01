import { createContainer } from "unstated-next";
import React, { useState } from "react";
import MapEditRectCallout from "../components/Callouts/MapEditRectCallout";
import MapEditPolygonCallout from "../components/Callouts/MapEditPolygonCallout";
import useLocalStorage from "../../../components/useStickyState";
import { ICalloutObject } from "../../../components/callouts/callouts.interfaces";

type SelectedId = string | undefined;

export interface IEditorStore {
    edit: boolean;
    setEdit: React.Dispatch<React.SetStateAction<boolean>>;
    tool: number;
    setTool: React.Dispatch<React.SetStateAction<number>>;
    updatedCallouts: any[];
    setUpdatedCallouts: React.Dispatch<React.SetStateAction<any[]>>;
    selectedId: SelectedId;
    setSelectedId: React.Dispatch<React.SetStateAction<SelectedId>>;
}

function Store() {
    const [edit, setEdit] = useState<boolean>(false);
    const [tool, setTool] = useState<number>(0);
    const [selectedShape, setSelectedShape] = useState<
        MapEditRectCallout | MapEditPolygonCallout | null
    >(null);
    const [hoveredShapeId, setHoveredShapeId] = useState<string | null>();
    const [calloutDeleted, setCalloutDeleted] = useState(false);
    const [visibleText, setVisibleText] = useLocalStorage<boolean>(
        "editorTextVisible",
        false
    );
    const [updatedCallouts, setUpdatedCallouts] = useState<ICalloutObject[]>(
        []
    );
    const [newCallouts, setNewCallouts] = useState<ICalloutObject[]>([]);

    return {
        edit,
        setEdit,
        tool,
        setTool,
        updatedCallouts,
        setUpdatedCallouts,
        selectedShape,
        setSelectedShape,
        visibleText,
        setVisibleText,
        hoveredShapeId,
        setHoveredShapeId,
        calloutDeleted,
        setCalloutDeleted,
        newCallouts,
        setNewCallouts,
    };
}

export default createContainer(Store);
