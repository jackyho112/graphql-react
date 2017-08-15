import React, { Component } from 'react'
import { graphql, gql } from 'react-apollo'
import Link from './Link'

export const ALL_LINKS_QUERY = gql`
  query AllLinksQuery {
    allLinks {
      id
      createdAt
      url
      description
      postedBy {
        id
        name
      }
      votes {
        id
        user {
          id
        }
      }
    }
  }
`

class LinkList extends Component {

  updateCacheAfterVote = (store, createVote, linkId) => {
    const data = store.readQuery({ query: ALL_LINKS_QUERY })

    const votedLink = data.allLinks.find(link => link.id === linkId)
    votedLink.votes = createVote.link.votes

    store.writeQuery({ query: ALL_LINKS_QUERY, data })
  }

  render() {
    const { allLinksQuery } = this.props;


    if (allLinksQuery && allLinksQuery.loading) {
      return <div>Loading</div>;
    }

    if (allLinksQuery && allLinksQuery.error) {
      return <div>Error</div>;
    }

    const linksToRender = allLinksQuery.allLinks;

    return (
      <div>
        {linksToRender.map((link, index) => (
          <Link
            key={link.id}
            index={index}
            link={link}
            updateStoreAfterVote={this.updateCacheAfterVote}
          />
        ))}
      </div>
    )
  }

}

export default graphql(ALL_LINKS_QUERY, { name: 'allLinksQuery' })(LinkList);
