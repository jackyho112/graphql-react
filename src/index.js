import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import App from './components/App'
import registerServiceWorker from './registerServiceWorker'
import './styles/index.css'
import { ApolloProvider, createNetworkInterface, ApolloClient } from 'react-apollo'

const networkInterface = createNetworkInterface({
  uri: 'https://api.graph.cool/simple/v1/cj6bhz7g80jl5012198yntokd'
})

const client = new ApolloClient({
  networkInterface
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
