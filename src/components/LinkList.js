import React, { Component } from 'react'
import { graphql, gql } from 'react-apollo'
import Link from './Link'

const ALL_LINKS_QUERY = gql`
  query AllLinksQuery {
    allLinks {
      id
      createdAt
      url
      description
    }
  }
`

class LinkList extends Component {

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
        {linksToRender.map(link => (
          <Link key={link.id} link={link}/>
        ))}
      </div>
    )
  }

}

export default graphql(ALL_LINKS_QUERY, { name: 'allLinksQuery' })(LinkList);
