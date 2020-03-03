import React, { Component } from "react"
import {
    Card, Image, Container
} from "semantic-ui-react";

export default class MapListComponent extends Component {
    componentDidMount() {
        this.props.getMapList();

        this.url_prefix = (this.props.admin === undefined) ? '' : 'admin/';
    }
    render() {
        if (this.props.error) {
            return (
                <div>
                    {this.props.error}
                </div>
            )
        } else if (this.props.isLoading || !this.props.mapList) {
            return (
                <div>
                    Loading
                </div>
            )
        } else {
            return (
                <Container style={{padding: "1rem"}}>
                    <Card.Group>
                        {this.props.mapList.map((map, index) => {
                            return (
                                <Card key={index} className="map-thumbnail"
                                        onClick={() => this.props.goToRoute(`maps/${map.short_code}`)}>
                                    <Image src={process.env.PUBLIC_URL + `/img/maps/${map.short_code}/thumbnail.png`} wrapped ui={false} />
                                    <Card.Content>
                                        <Card.Header>{map.name}</Card.Header>
                                    </Card.Content>
                                </Card>
                            )
                        })}
                    </Card.Group>
                    <ul>

                    </ul>
                </Container>
            )
        }
    }
}