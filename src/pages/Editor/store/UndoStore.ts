import { createContainer } from "unstated-next";
import { useEffect, useState } from "react";

interface EditorAction {
    action: string;
    previous: any;
    current: any;
}

function useStore() {
    const [undoStack, setUndoStack] = useState<EditorAction[]>([]);
    const [redoStack, setRedoStack] = useState<EditorAction[]>([]);

    const canRedo = (): boolean => {
        return redoStack.length > 0;
    };

    const canUndo = (): boolean => {
        return undoStack.length > 0;
    };

    useEffect(() => {
        console.log("%cUndo: ", "color: red;", { undoStack });
        console.log("%cRedo: ", "color: green;", { redoStack });
    }, [undoStack, redoStack]);

    const filter = (id) => {
        console.log("filtering: ", id);
        console.log(undoStack, redoStack);
        const stacks = [undoStack, redoStack];
        const setters = [setUndoStack, setRedoStack];

        // todo: figure out previous current with filtering
        for (let i = 0; i < stacks.length; i += 1) {
            const stack = stacks[i];
            const setter = setters[i];
            if (stack.length > 0) {
                const filteredStack = stack.filter((action) => {
                    return action.current.id !== id;
                });

                if (filteredStack.length !== undoStack.length) {
                    console.log(
                        `${id} was filtered from: ${stack} to ${filteredStack}`
                    );
                    setter(filteredStack);
                }
            }
        }
    };
    return {
        undoStack,
        setUndoStack,
        redoStack,
        setRedoStack,
        filter,
        canRedo,
        canUndo,
    };
}

export default createContainer(useStore);
