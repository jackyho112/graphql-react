import React, { Component } from 'react'
import { graphql, gql } from 'react-apollo'
import Link from './Link'
import { GC_USER_ID, GC_AUTH_TOKEN, LINKS_PER_PAGE } from '../constants'

export const ALL_LINKS_QUERY = gql`
  query AllLinksQuery($first: Int, $skip: Int, $orderBy: LinkOrderBy) {
    allLinks(first: $first, skip: $skip, orderBy: $orderBy) {
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
    _allLinksMeta {
      count
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

  getLinksToRender = (isNewPage) => {
    if (isNewPage) {
      return this.props.allLinksQuery.allLinks
    }
    const rankedLinks = this.props.allLinksQuery.allLinks.slice()
    rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length)
    return rankedLinks
  }

  nextPage = () => {
    const page = parseInt(this.props.match.params.page, 10)
    if (page <= this.props.allLinksQuery._allLinksMeta.count / LINKS_PER_PAGE) {
      const nextPage = page + 1
      this.props.history.push(`/new/${nextPage}`)
    }
  }

  previousPage = () => {
    const page = parseInt(this.props.match.params.page, 10)
    if (page > 1) {
      const previousPage = page - 1
      this.props.history.push(`/new/${previousPage}`)
    }
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
      console.log(allLinksQuery.error)
      return <div>Error</div>;
    }

    const isNewPage = this.props.location.pathname.includes('new')
    const linksToRender = this.getLinksToRender(isNewPage)
    const userId = localStorage.getItem(GC_USER_ID)

    return (
      <div>
        {!userId ?
          <button onClick={() => {
            this.props.history.push('/login')
          }}>Login</button> :
          <div>
            <button onClick={() => {
              this.props.history.push('/create')
            }}>New Post</button>
            <button onClick={() => {
              localStorage.removeItem(GC_USER_ID)
              localStorage.removeItem(GC_AUTH_TOKEN)
              this.forceUpdate()
            }}>Logout</button>
          </div>
        }
        <div>
          {linksToRender.map((link, index) => (
            <Link
              key={link.id}
              updateStoreAfterVote={this._updateCacheAfterVote}
              link={link}
              index={index}
            />
          ))}
        </div>
        {isNewPage &&
        <div>
          <button onClick={() => this.previousPage()}>Previous</button>
          <button onClick={() => this.nextPage()}>Next</button>
        </div>
        }
      </div>
    )
  }

}

export default graphql(
  ALL_LINKS_QUERY, {
    name: 'allLinksQuery',
    options: (ownProps) => {
      const page = parseInt(ownProps.match.params.page, 10)
      const isNewPage = ownProps.location.pathname.includes('new')
      const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
      const first = isNewPage ? LINKS_PER_PAGE : 100
      const orderBy = isNewPage ? 'createdAt_DESC' : null
      return {
        variables: { first, skip, orderBy }
      }
    }
  }
)(LinkList);
