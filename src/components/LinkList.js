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

  subscribeToNewVotes = () => {
    this.props.allLinksQuery.subscribeToMore({
      document: gql`
        subscription {
          Vote(filter: {
            mutation_in: [CREATED]
          }) {
            node {
              id
              link {
                id
                url
                description
                createdAt
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
              user {
                id
              }
            }
          }
        }
      `,
      updateQuery: (previous, { subscriptionData }) => {
        const votedLinkIndex = previous.allLinks.findIndex(
          link => link.id === subscriptionData.data.Vote.node.link.id
        )
        const link = subscriptionData.data.Vote.node.link
        const newAllLinks = previous.allLinks.slice()
        newAllLinks[votedLinkIndex] = link
        const result = {
          ...previous,
          allLinks: newAllLinks
        }
        return result
      }
    })
  }

  subscribeToNewLinks = () => {
    this.props.allLinksQuery.subscribeToMore({
      document: gql`
        subscription {
          Link(filter: {
            mutation_in: [CREATED]
          }) {
            node {
              id
              url
              description
              createdAt
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
        }
      `,
      
      updateQuery: (previous, { subscriptionData }) => {
        const newAllLinks = [
          subscriptionData.data.Link.node,
          ...previous.allLinks
        ]

        const result = {
          ...previous,
          allLinks: newAllLinks
        }

        return result
      }
    })
  }

  updateCacheAfterVote = (store, createVote, linkId) => {
    const data = store.readQuery({ query: ALL_LINKS_QUERY })

    const votedLink = data.allLinks.find(link => link.id === linkId)
    votedLink.votes = createVote.link.votes

    store.writeQuery({ query: ALL_LINKS_QUERY, data })
  }

  componentDidMount() {
    this.subscribeToNewLinks()
    this.subscribeToNewVotes()
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
