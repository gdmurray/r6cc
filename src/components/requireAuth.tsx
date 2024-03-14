import React, { useEffect } from "react";
import { connect } from "react-redux";

export default (ChildComponent) => {
    const ComposedComponent = (props) => {
        useEffect(() => {
            if (props.auth.isLoaded && props.auth.isEmpty)
                return props.history.push("/login");
        }, [props.auth, props.history]);

        return <ChildComponent {...props} />;
    };

    function mapStateToProps(state) {
        return {
            auth: state.firebase.auth,
        };
    }

    return connect(mapStateToProps)(ComposedComponent);
};
