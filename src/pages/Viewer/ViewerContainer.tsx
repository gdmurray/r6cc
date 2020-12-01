import React from "react";
import AppWrapper from "../../components/navigation/AppWrapper";
import Viewer from "./Viewer";

const ViewerContainer = (props): JSX.Element => {
    return (
        <AppWrapper withFooter={false}>
            <Viewer {...props} />
        </AppWrapper>
    );
};

export default ViewerContainer;
