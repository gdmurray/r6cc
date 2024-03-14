import React from "react";
import EditorStore from "./store/EditorStore";
import UndoStore from "./store/UndoStore";
import Editor from "./Editor";
import requireAuth from "../../components/requireAuth";
import AppWrapper from "../../components/navigation/AppWrapper";

const EditorContainer = (props): JSX.Element => {
    return (
        <AppWrapper>
            <EditorStore.Provider>
                <UndoStore.Provider>
                    <Editor {...props} />
                </UndoStore.Provider>
            </EditorStore.Provider>
        </AppWrapper>
    );
};

export default requireAuth(EditorContainer);
