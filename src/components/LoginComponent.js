import React, { Component } from 'react'
import { Container, Button, Form} from 'semantic-ui-react';

export default class LoginForm extends Component {
    state = {
        email: '',
        password: ''
    }

    handleInputChange = (event) => {
        const target = event.target, value = target.type ===
            'checkbox' ? target.checked : target.value,
            name = target.name

        this.setState({
            [name]: value
        });
    }

    onSubmit = (event) => {
        event.preventDefault()
        console.log(this.state.email, this.state.password);
        this.props.onSubmit(this.state.email, this.state.password)
      }

    render(){
        const errors = this.props.errors || {}
        return (
            <Container>
                <Form onSubmit={this.onSubmit}>
                    <h1>Authentication</h1>
                    <Form.Input name="email" label="Email" type="email"
                        error={errors.email} onChange={this.handleInputChange}/>
                    <Form.Input name="password" label="Password" type="password"
                        error={errors.password} onChange={this.handleInputChange}/>
                    <Button type="submit">Submit</Button>
                </Form>
            </Container>
        )
    }
}