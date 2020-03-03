import React, { Component } from "react";
import {
    Segment, Menu, Icon, Button
} from "semantic-ui-react";
import { ROUTES } from "../constants";

export default class NavComponent extends Component {
    getNavOptions = () => {
        if (this.props.isAuthenticated) {
            return (
                <Menu.Menu position="right">
                    <Menu.Item>
                        <Button onClick={() => this.props.goToRoute(ROUTES.ADMIN)} primary>Admin</Button>
                    </Menu.Item>
                    <Menu.Item>
                        <Button onClick={() => this.props.logout()} primary>Log Out</Button>
                    </Menu.Item>
                </Menu.Menu>

            )
        }else{
            return (
                <Menu.Menu position='right'>
                    <Menu.Item>
                        <Button onClick={() => this.props.goToRoute(ROUTES.LOGIN)} primary>Sign In</Button>
                    </Menu.Item>
                </Menu.Menu>
            )
        }
    }
    render() {
        return (
            <Segment inverted style={{ borderRadius: '0px', marginBottom: "0px" }}>
                <Menu inverted pointing secondary>
                    <Menu.Item onClick={() => this.props.goToRoute("/")}
                        name='R6CC'
                    />
                    <Menu.Item onClick={() => this.props.goToRoute(ROUTES.MAPLIST)}>
                        <Icon name='map outline' />
                    </Menu.Item>
                    {this.getNavOptions()}
                </Menu>
            </Segment>
        );
    }
}