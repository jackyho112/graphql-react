import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { ApolloProvider, createNetworkInterface, ApolloClient } from 'react-apollo'
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'
import App from './components/App'
import registerServiceWorker from './registerServiceWorker'
import './styles/index.css'
import { GC_AUTH_TOKEN } from './constants'

const networkInterface = createNetworkInterface({
  uri: 'https://api.graph.cool/simple/v1/cj6bhz7g80jl5012198yntokd'
})

const wsClient = new SubscriptionClient(
  'wss://subscriptions.ap-northeast-1.graph.cool/v1/cj6bhz7g80jl5012198yntokd',
  {
    reconnect: true,
    connectParams: {
      authToken: localStorage.getItem(GC_AUTH_TOKEN),
    }
  }
)

const networkInterfaceWithSubscription = addGraphQLSubscriptions(
  networkInterface,
  wsClient
)

networkInterface.use([{
  applyMiddleware(req, next) {
    if(!req.options.headers) {
      req.options.headers = {}
    }

    const token = localStorage.getItem(GC_AUTH_TOKEN)
    req.options.headers.authoirzation = token ? `Bearer ${token}` : null
    next()
  }
}])

const client = new ApolloClient({
  networkInterface: networkInterfaceWithSubscription
})

ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById('root')
)
registerServiceWorker()
