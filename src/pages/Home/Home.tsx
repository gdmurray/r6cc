import React from "react";
import AppWrapper from "../../components/navigation/AppWrapper";
import MapList from "../Maps/components/MapList";

export default class Home extends React.Component<any, any> {
    render() {
        return (
            <AppWrapper withFooter={true}>
                <h1>Welcome to R6CC</h1>
                This is where some landing page stuff would go, some hero
                content, some good good stuff.
                <section>
                    <h2>Maps</h2>
                    <MapList />
                </section>
            </AppWrapper>
        );
    }
}
