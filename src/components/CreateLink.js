import React, { Component } from 'react'
import { graphql, gql } from 'react-apollo'
import { GC_USER_ID } from '../constants'

const CREATE_LINK_MUTATION = gql`
  mutation CreateLinkMutation($description: String!, $url: String!) {
    createLink(
      description: $description,
      url: $url,
      postedById: $postedById
    ) {
      id
      createdAt
      url
      description
      postedBy {
        id
        name
      }
    }
  }
`

class CreateLink extends Component {
  state = {
    description: '',
    url: ''
  }

  createLink = async () => {
    const postedById = localStorage.getItem(GC_USER_ID)
    if (!postedById) {
      console.error('No user logged in')
      return
    }

    const { description, url } = this.state
    await this.props.createLinkMutation({
      variables: {
        description,
        url
      }
    })
    this.props.history.push('/');
  }

  render() {
    return (
      <div>
        <div className='flex flex-column mt3'>
          <input
            className='mb2'
            value={this.state.description}
            onChange={e => this.setState({ description: e.target.value })}
            type='text'
            placeholder='A description for link'
          />
          <input
            className='mb2'
            value={this.state.url}
            onChange={e => this.setState({ url: e.target.value })}
            type='text'
            placeholder='The URL for the link'
          />
        </div>
        <button onClick={() => this.createLink()}>
          Submit
        </button>
      </div>
    )
  }
}

export default graphql(CREATE_LINK_MUTATION, { name: 'createLinkMutation' })(CreateLink)
