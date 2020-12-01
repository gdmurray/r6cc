import React, { useCallback, useEffect, useRef, useState } from "react";
import MapWrapper, { MapState } from "../../../components/maps/MapWrapper";
import EditorStore from "../store/EditorStore";
import { TOOLS } from "../../../constants";
import { Icon, Menu, Popup } from "semantic-ui-react";
import MapEditCanvas from "./MapEditCanvas";
import MapEditRectCallout from "./Callouts/MapEditRectCallout";
import MapEditPolygonCallout from "./Callouts/MapEditPolygonCallout";
import { MapMode } from "../../../components/maps/BaseMapView";
import {
    EyeFilled,
    EyeInvisibleOutlined,
    FontSizeOutlined,
} from "@ant-design/icons";
import UndoStore from "../store/UndoStore";
import { ICalloutObject } from "../../../components/callouts/callouts.interfaces";

const _ = require("lodash");
const _findIndex = require("lodash/findIndex");
const _cloneDeep = require("lodash/cloneDeep");

interface MapEditorState extends MapState {
    tool: number;
    updatedCallouts: any[];
    updatedCalloutIds: any[];
    selectedId: string | null;
    calloutDeleted: boolean;
    modifiedCallouts: any[];
}

interface INewCallout {
    id?: string;
    callout: string;
    callout_alt: string;
    shape: any;
    map: string;
    floor: number;
}

export interface ICalloutActions {
    create(callout: ICalloutObject): void;

    update(callout: ICalloutObject): void;

    delete(calloutId: string): void;

    transform(previous: ICalloutObject, current: ICalloutObject): void;
}

export enum Floor {
    UP,
    DOWN,
}

/*
    Handles the actions, state, and changes for the canvas
 */
const MapEditor = (props) => {
    const _cache = {};
    const editorStore = EditorStore.useContainer();
    const undoStore = UndoStore.useContainer();
    const [activeFloor, setActiveFloor] = useState<number>(0);
    const [activeCallouts, setActiveCallouts] = useState<any[]>([]);
    const [canSave, setCanSave] = useState<boolean>(false);
    const editContainer = useRef(null);

    const updateCalloutCallback = useCallback(
        (callout: ICalloutObject) => () => {
            updateCallout(callout);
        },
        []
    );

    const moveFloor = (direction: number): void => {
        if (direction === Floor.UP) {
            const { map } = props;
            if (activeFloor < map.floors.length - 1) {
                setActiveFloor(activeFloor + 1);
            }
        } else if (direction === Floor.DOWN) {
            if (activeFloor > 0) {
                setActiveFloor(activeFloor - 1);
            }
        }
    };

    const _handleKeyDown = (event: KeyboardEvent) => {
        switch (event.code) {
            case "ArrowUp":
                event.preventDefault();
                moveFloor(Floor.UP);
                return;
            case "ArrowDown":
                event.preventDefault();
                moveFloor(Floor.DOWN);
                return;
            case "Backspace":
                // This logic allows the user edit things such as the input field and
                // press backspace without deleting the selected callout.
                // Only deletes when body is in focus
                if (document.hasFocus()) {
                    const { activeElement } = document;
                    if (activeElement) {
                        if (activeElement.nodeName === "BODY") {
                            handleDelete();
                        }
                    }
                }
                return;
            case "KeyZ":
                if (event.metaKey || event.ctrlKey) {
                    if (document.hasFocus()) {
                        const { activeElement } = document;
                        if (activeElement) {
                            if (activeElement.nodeName === "BODY") {
                                if (event.shiftKey) {
                                    redoAction();
                                } else {
                                    undoAction();
                                }
                            }
                        }
                    }
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

    // Fetch Callouts when activeFloor Changed
    useEffect(() => {
        // This is where the logic will live for attempting persist and cache.
        console.log("Fetching Active Callouts");
        const { map } = props;
        props.getCallouts(map.short_code, activeFloor);
    }, [activeFloor]);

    /**
     * Creates a new callout object and adds that action to the undo stack
     * @param callout {ICalloutObject} The callout object to create
     */
    const createCallout = (callout: ICalloutObject) => {
        const { undoStack, setUndoStack } = undoStore;
        const { newCallouts, setNewCallouts } = editorStore;
        const newActiveCallouts = [...activeCallouts, callout];

        undoStack.push({
            action: "CREATE_SHAPE",
            current: _cloneDeep(callout),
            previous: "DELETE_SHAPE",
        });
        setUndoStack(undoStack);

        setActiveCallouts(newActiveCallouts);
        newCallouts.push(callout);
        setNewCallouts(newCallouts);
    };
    /**
     * Updates a callout
     * If the callout is an uncommitted object, it adds to newCallouts
     * If it exists in the database, it adds to updatedCallouts
     * @param callout {ICalloutObject} The callout to update
     */
    const updateCallout = (callout: ICalloutObject) => {
        const {
            updatedCallouts,
            setUpdatedCallouts,
            newCallouts,
            setNewCallouts,
        } = editorStore;
        console.log("UPDATE CALLOUT: ", callout);
        // 1. Check if Callout is a recently created or existing callout;
        if (callout.id.startsWith("tmp-")) {
            // Is new Object
            // See if object exists in activeCallouts...
            const calloutIndex = _findIndex(activeCallouts, { id: callout.id });
            let newActiveCallouts = activeCallouts;
            if (calloutIndex !== -1) {
                newActiveCallouts[calloutIndex] = callout;
            } else {
                newActiveCallouts = [...activeCallouts, callout];
            }

            // update active callouts
            setActiveCallouts(newActiveCallouts);
            // Found object in new callouts
            const newCalloutIndex = _findIndex(newCallouts, { id: callout.id });
            if (newCalloutIndex !== -1) {
                newCallouts[newCalloutIndex] = callout;
            } else {
                newCallouts.push(callout);
            }
            // Update new callouts
            setNewCallouts(newCallouts);
            // 2. If callout id exists
        } else {
            // Callout exists from database
            const calloutIndex = _findIndex(activeCallouts, { id: callout.id });
            if (calloutIndex !== -1) {
                activeCallouts[calloutIndex] = callout;
            }

            setActiveCallouts([...activeCallouts]);
            const updatedCalloutIndex = _findIndex(updatedCallouts, {
                id: callout.id,
            });

            // Callout has been updated prior
            if (updatedCalloutIndex !== -1) {
                updatedCallouts[updatedCalloutIndex] = callout;
            } else {
                updatedCallouts.push(callout);
            }

            setUpdatedCallouts(updatedCallouts);
        }
    };

    useEffect(() => {
        const { callouts, insertedCallouts } = props as {
            callouts: ICalloutObject[];
            insertedCallouts: Record<string, string>;
        };
        const { updatedCallouts, newCallouts, setNewCallouts } = editorStore;

        // Need some sort of creator for what activeCallouts is gonna be.
        // Check if any of the inserted tmp keys are here
        const currentActiveCallouts: ICalloutObject[] = [];

        // Check if operations have completed...
        if (!props.loading && !props.inserting && !props.updating) {
            // Check if Object has been inserted
            if (Object.keys(insertedCallouts).length > 0) {
                const { filter } = undoStore;

                for (const [tmpId, newId] of Object.entries(insertedCallouts)) {
                    const insertedCalloutIndex = _findIndex(newCallouts, {
                        id: tmpId,
                    });
                    if (insertedCalloutIndex !== -1) {
                        newCallouts[insertedCalloutIndex].id = newId;
                    }

                    filter(tmpId);
                }
                setNewCallouts(newCallouts);
            }

            const newFloorCallouts = newCallouts.filter((callout) => {
                return callout.floor === activeFloor;
            });

            const updatedFloorCallouts = updatedCallouts.filter((callout) => {
                return callout.floor === activeFloor;
            });

            // Replace database fetched entries with ones that are still being updated
            let filteredUpdatedCallouts = callouts.map((callout) => {
                const updatedCalloutIndex = _findIndex(updatedFloorCallouts, {
                    id: callout.id,
                });
                if (updatedCalloutIndex !== -1) {
                    return updatedFloorCallouts[updatedCalloutIndex];
                }
                return callout;
            });

            // Filter out new callouts
            const filteredCallouts: ICalloutObject[] = filteredUpdatedCallouts.filter(
                (value) => {
                    return (
                        _findIndex(newFloorCallouts, { id: value.id }) === -1
                    );
                }
            );

            currentActiveCallouts.push(...filteredCallouts);
            currentActiveCallouts.push(...newFloorCallouts);
            setActiveCallouts(currentActiveCallouts);
        }
    }, [props.callouts, props.insertedCallouts]);

    const handleToolChange = (toolChange): void => {
        const { setTool, edit, setEdit } = editorStore;
        setTool(toolChange);
        if (!edit) {
            setEdit(true);
        }
    };

    const handleModeChange = (mode): void => {
        const { edit, setEdit, selectedShape, setSelectedShape } = editorStore;
        if (selectedShape) {
            setSelectedShape(null);
        }
        setEdit(mode);
    };

    const showSave = (): boolean => {
        const { updatedCallouts, newCallouts } = editorStore;
        console.log("SHOW SAVE: ");
        console.log(updatedCallouts, newCallouts);

        return updatedCallouts.length > 0 || newCallouts.length > 0;
    };

    type MapEditCallout =
        | MapEditRectCallout
        | MapEditPolygonCallout
        | undefined;

    const handleDelete = () => {
        /*
            Handler for when the delete toolbar button is pressed
         */
        const { selectedShape } = editorStore as {
            selectedShape: MapEditCallout;
        };
        if (selectedShape) {
            console.log("SHAPE SELECTED: ", selectedShape);
            const { callout } = selectedShape;
            const { id } = callout;
            deleteCallout(id);
        }
    };

    const deleteCallout = (id: string) => {
        /*
            Function which deletes the callout
            takes calloutId as parameter, filters out callouts and updates them.
         */
        const {
            updatedCallouts,
            setUpdatedCallouts,
            newCallouts,
            setNewCallouts,
            selectedShape,
            setSelectedShape,
        } = editorStore;

        console.log("Deleting Callout: ", id);
        const filteredNewCallouts = newCallouts.filter((callout) => {
            return callout.id !== id;
        });

        // This was broken... it set new callouts, not sure why
        const filteredUpdatedCallouts = updatedCallouts.filter((callout) => {
            return callout.id !== id;
        });

        setNewCallouts(filteredNewCallouts);
        setUpdatedCallouts(filteredUpdatedCallouts);

        if (!id.startsWith("tmp-")) {
            // No callouts refresh triggered
            console.log("Deleting callout from database: ", id);
            props.deleteCallout(id);
        }

        const filteredActiveCallouts = activeCallouts.filter((callout) => {
            return callout.id !== id;
        });

        if (selectedShape) {
            const { callout } = selectedShape;
            if (callout.id === id) {
                setSelectedShape(null);
            }
        }
        setActiveCallouts(filteredActiveCallouts);
    };

    const saveCallouts = () => {
        const { updatedCallouts, newCallouts } = editorStore;

        if (newCallouts.length > 0) {
            props.insertCallouts(newCallouts);
        }

        if (updatedCallouts.length > 0) {
            props.updateCallouts(updatedCallouts);
        }
    };

    /**
     * Registers the callout change with the undo stack
     * Keeps track of the previous state, and current state.
     * @param previous {ICalloutObject} The previous callout state
     * @param current {ICalloutObject} The current callout state
     */
    const transformCallout = (
        previous: ICalloutObject,
        current: ICalloutObject
    ) => {
        const { undoStack, setUndoStack } = undoStore;

        undoStack.push({
            action: "TRANSFORM_SHAPE",
            current: _cloneDeep(current),
            previous: _cloneDeep(previous),
        });

        setUndoStack([...undoStack]);
    };

    /**
     * Performs undo/redo transform transaction for a callout
     * @param payload {ICalloutObject} The callout to set
     */
    const performTransform = (payload: ICalloutObject): void => {
        /*
            When undo/redo is called and a callout is meant to revert to a different state.
         */

        console.log("Perform transform: ", payload);
        const calloutIndex = _findIndex(activeCallouts, {
            id: payload.id,
        });
        if (calloutIndex !== -1) {
            activeCallouts[calloutIndex] = _cloneDeep(payload);
            setActiveCallouts([...activeCallouts]);
            console.log("Set Active callouts...", [...activeCallouts], payload);
        }
    };

    const undoAction = () => {
        /*
            When an Undo is Triggered, either from keyboard or the Undo Button
            Handles different actions from the undoStack.
         */
        const {
            canUndo,
            redoStack,
            setRedoStack,
            undoStack,
            setUndoStack,
        } = undoStore;
        // console.log("UNDO ACTION CALLED");
        if (canUndo()) {
            const action = undoStack.pop();
            if (action) {
                switch (action.action) {
                    case "CREATE_SHAPE": {
                        // console.log("UNDO CREATED SHAPE... delete shape");
                        redoStack.push({
                            action: "CREATE_SHAPE",
                            current: _cloneDeep(action.current),
                            previous: "DELETE_SHAPE",
                        });
                        setRedoStack([...redoStack]);
                        deleteCallout(action.current.id);
                        break;
                    }
                    // case "DELETE_SHAPE": {
                    //     console.log("UNDO ACTION IS DELETE SHAPE");
                    //     const { newCallouts, setNewCallouts } = editorStore;
                    //     redoStack.push({
                    //         action: "CREATE_SHAPE",
                    //         payload: _cloneDeep(action.payload),
                    //     });
                    //     setRedoStack([...redoStack]);
                    //     console.log("SETTING REDO STACK");
                    //     const filteredNewCallouts = newCallouts.filter(
                    //         (callout) => {
                    //             return callout.id !== action.payload.id;
                    //         }
                    //     );
                    //     console.log(
                    //         "FILTERED NEW CALLOUTS: ",
                    //         filteredNewCallouts
                    //     );
                    //     setNewCallouts(filteredNewCallouts);
                    //
                    //     const filteredActiveCallouts = activeCallouts.filter(
                    //         (callout) => {
                    //             return callout.id !== action.payload.id;
                    //         }
                    //     );
                    //     console.log(
                    //         "FILTERED ACTIVE CALLOUTS: ",
                    //         filteredActiveCallouts
                    //     );
                    //     setActiveCallouts(filteredActiveCallouts);
                    //     break;
                    // }
                    case "TRANSFORM_SHAPE": {
                        // undo a transform
                        // console.log("TRANSFORM SHAPE UNDO: ", action);
                        redoStack.push({
                            action: "TRANSFORM_SHAPE",
                            previous: action.previous,
                            current: action.current,
                        });

                        setRedoStack([...redoStack]);

                        performTransform(action.previous);
                        break;
                    }
                    default:
                        console.log("THIS ACTION IS NOT SUPPORTED: ", action);
                        return;
                }
            }
            setUndoStack([...undoStack]);
        }
    };

    const redoAction = () => {
        const {
            canRedo,
            redoStack,
            setRedoStack,
            undoStack,
            setUndoStack,
        } = undoStore;
        if (canRedo()) {
            const action = redoStack.pop();
            if (action) {
                switch (action.action) {
                    case "CREATE_SHAPE":
                        console.log("CREATE SHAPE REDO: ", action);
                        createCallout(action.current);
                        break;
                    case "TRANSFORM_SHAPE":
                        console.log("TRANSFORM SHAPE REDO");
                        undoStack.push({
                            action: "TRANSFORM_SHAPE",
                            current: _cloneDeep(action.current),
                            previous: _cloneDeep(action.previous),
                        });
                        setUndoStack([...undoStack]);
                        performTransform(action.current);
                        break;
                    // console.log("TRANSFORM REDO: ", action);
                    // undoStack.push({
                    //     action: "TRANSFORM_SHAPE",
                    //     payload: _cloneDeep(action.payload),
                    // });
                    // setUndoStack([...undoStack]);
                    // performTransform(action.payload);
                    default:
                        return;
                }
            }
            setRedoStack([...redoStack]);
        }
    };
    const { tool, edit, visibleText, setVisibleText } = editorStore;
    const { canUndo, canRedo } = undoStore;

    const calloutController: ICalloutActions = {
        create: createCallout,
        update: updateCallout,
        delete: deleteCallout,
        transform: transformCallout,
    };

    return (
        <div className="edit-map-pane" ref={editContainer}>
            <div className="map-pane">
                <Menu icon style={{ borderRadius: "0px" }}>
                    <Menu>
                        <p>Mode</p>
                        <Menu.Item
                            active={!edit}
                            onClick={() => handleModeChange(false)}
                            name="move"
                        >
                            <Popup
                                trigger={<Icon name="move" />}
                                content="Move Canvas"
                                position="top left"
                            />
                            <p>Move</p>
                        </Menu.Item>
                        <Menu.Item
                            active={edit}
                            onClick={() => handleModeChange(true)}
                            name="Edit"
                        >
                            <Popup
                                trigger={<Icon name="pencil square" />}
                                content="Edit Canvas"
                                position="top center"
                            />
                            <p>Edit</p>
                        </Menu.Item>
                    </Menu>
                    <Menu>
                        <p>Draw</p>
                        <Menu.Item
                            active={tool === TOOLS.RECTANGLE && edit}
                            onClick={() => handleToolChange(TOOLS.RECTANGLE)}
                            name="Rectangle Tool"
                        >
                            <Popup
                                trigger={<Icon name="square outline" />}
                                content="Draw Rectangle"
                                position="top center"
                            />
                            <p>Rectangle</p>
                        </Menu.Item>
                        <Menu.Item
                            active={tool === TOOLS.POLYGON && edit}
                            onClick={() => handleToolChange(TOOLS.POLYGON)}
                            name="Polygon Tool"
                        >
                            <Popup
                                trigger={<Icon name="pencil" />}
                                content="Draw Polygon"
                                position="top center"
                            />
                            <p>Polygon</p>
                        </Menu.Item>
                        <Menu.Item
                            active={tool === TOOLS.FOCAL && edit}
                            onClick={() => handleToolChange(TOOLS.FOCAL)}
                            name="Focal Point Tool"
                        >
                            <Popup
                                trigger={<Icon name="crop" />}
                                content="Draw Focal Point"
                                position="top center"
                            />
                            <p>Focal</p>
                        </Menu.Item>
                    </Menu>
                    <Menu>
                        <p>Modify</p>
                        <Menu.Item
                            active={tool === TOOLS.TRANSFORM && edit}
                            onClick={() => handleToolChange(TOOLS.TRANSFORM)}
                            name="Transform Tool"
                        >
                            <Popup
                                trigger={
                                    <Icon name="expand arrows alternate" />
                                }
                                content="Transform Tool"
                                position="top center"
                            />
                            <p>Transform</p>
                        </Menu.Item>
                        <Menu.Item
                            active={tool === TOOLS.POINT_TRANSFORM && edit}
                            onClick={() =>
                                handleToolChange(TOOLS.POINT_TRANSFORM)
                            }
                            name="Point Transform Tool"
                        >
                            <Popup
                                trigger={<Icon name="dot circle outline" />}
                                content="Edit Polygon"
                                position="top center"
                            />
                            <p>P. Transform</p>
                        </Menu.Item>
                        <Menu.Item
                            active={tool === TOOLS.EDIT && edit}
                            onClick={() => handleToolChange(TOOLS.EDIT)}
                            name="Edit Tool"
                        >
                            <Popup
                                trigger={<Icon name="edit outline" />}
                                content="Edit Callout"
                                position="top center"
                            />
                            <p>Edit Call</p>
                        </Menu.Item>
                    </Menu>
                    <Menu>
                        <p>Actions</p>
                        <Menu.Item
                            // disabled={selectedId === null}
                            onClick={handleDelete}
                            name="Delete tool"
                        >
                            <Popup
                                trigger={<Icon name="trash alternate" />}
                                content="Delete Callout"
                                position="top center"
                            />
                            <p>Delete</p>
                        </Menu.Item>
                        <Menu.Item onClick={saveCallouts} name="Save">
                            <Popup
                                trigger={<Icon name="save" />}
                                content="Save Callouts"
                                position="top center"
                            />
                            <p>Save</p>
                        </Menu.Item>
                        <Menu.Item
                            disabled={!canUndo()}
                            onClick={undoAction}
                            name="Save"
                        >
                            <Popup
                                trigger={<Icon name="undo" />}
                                content="Undo Action"
                                position="top center"
                            />
                            <p>Undo</p>
                        </Menu.Item>
                        <Menu.Item
                            disabled={!canRedo()}
                            onClick={redoAction}
                            name="Save"
                        >
                            <Popup
                                trigger={<Icon name="redo" />}
                                content="Redo Action"
                                position="top center"
                            />
                            <p>Redo</p>
                        </Menu.Item>
                        <Menu.Item
                            onClick={() => setVisibleText(!visibleText)}
                            name="Text"
                        >
                            <Popup
                                content="Show Callout Text"
                                position="top center"
                                trigger={
                                    visibleText ? (
                                        <EyeFilled />
                                    ) : (
                                        <EyeInvisibleOutlined />
                                    )
                                }
                            />
                            <p>Show Text</p>
                        </Menu.Item>
                    </Menu>
                </Menu>
            </div>
            <div>
                <MapEditCanvas
                    mode={MapMode.EDITOR}
                    map={props.map}
                    activeFloor={activeFloor}
                    activeCallouts={activeCallouts}
                    editorContainer={editContainer}
                    moveFloor={moveFloor}
                    calloutActions={calloutController}
                    updateCallout={updateCallout}
                    deleteCallout={deleteCallout}
                />
            </div>
        </div>
    );
};

export default MapEditor;
