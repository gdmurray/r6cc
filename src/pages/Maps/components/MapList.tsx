import React, { Component } from "react";
import { Card, Container, Icon, Image } from "semantic-ui-react";
import { FirebaseReducer } from "react-redux-firebase";
import { connect } from "react-redux";
import { push } from "connected-react-router";

export interface IMapBase {
    name: string;
    short_code: string;
}

export const Maps: IMapBase[] = [
    {
        name: "Bank",
        short_code: "bank",
    },
    {
        name: "Border",
        short_code: "border",
    },
    {
        name: "Clubhouse",
        short_code: "clubhouse",
    },
    {
        name: "Coastline",
        short_code: "coastline",
    },
    {
        name: "Consulate",
        short_code: "consulate",
    },
    {
        name: "Kafe Dostoyevsky",
        short_code: "kafe",
    },
    {
        name: "Villa",
        short_code: "villa",
    },
];

interface MapListProps {
    goToRoute(route: string): void;

    auth: FirebaseReducer.AuthState;
}

class MapList extends Component<MapListProps> {
    handleCardClick = (e) => {
        const { target, currentTarget } = e as {
            target: HTMLElement;
            currentTarget: HTMLElement;
        };
        const selectedMap = currentTarget.getAttribute("data-url");
        if (target.nodeName === "I") {
            this.props.goToRoute(`editor/${selectedMap}`);
        } else {
            this.props.goToRoute(`map/${selectedMap}`);
        }
    };

    renderIcon = (): JSX.Element => {
        const { auth } = this.props;
        if (auth.isLoaded) {
            if (!auth.isEmpty) {
                return <Icon className={"card-icon"} name="cog" />;
            }
        }
        return <></>;
    };

    render() {
        return (
            <Container style={{ padding: "1rem" }}>
                <Card.Group
                    style={{
                        justifyContent: "center",
                    }}
                >
                    {Maps.map((map, index) => {
                        return (
                            <Card
                                key={`map-${index}`}
                                className="map-thumbnail"
                                onClick={this.handleCardClick}
                                data-url={map.short_code}
                            >
                                <Image
                                    src={
                                        process.env.PUBLIC_URL +
                                        `/img/maps/${map.short_code}/thumbnail.png`
                                    }
                                    wrapped
                                    ui={false}
                                />
                                {this.renderIcon()}
                                <Card.Content>
                                    <Card.Header>{map.name}</Card.Header>
                                </Card.Content>
                            </Card>
                        );
                    })}
                </Card.Group>
            </Container>
        );
    }
}

const mapStateToProps = ({ firebase: { auth } }) => ({
    auth,
});

const mapDispatchToProps = (dispatch) => ({
    goToRoute: (route) => {
        dispatch(push(route));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(MapList);
