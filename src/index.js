import React from "react";
import ReactDOM from "react-dom";
import Root from "./Root";
import { ApolloProvider, Query } from 'react-apollo'
import { gql } from 'apollo-boost';
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import * as serviceWorker from "./serviceWorker";

import Auth from'./components/Auth'

const cache = new InMemoryCache();
const link = new HttpLink({
  uri: "http://127.0.0.1:8000/graphql/",
  fetchOptions: {
    credentials:"include"
  },
  headers:{
    Authorization:`JWT ${localStorage.getItem('authToken') || ""}`        
  },
  clientState: {
    defaults:{
      isLoggedIn: !!localStorage.getItem('authToken')
    }
  }
});

cache.writeData({
  data: {
    isLoggedIn: !!localStorage.getItem("authToken"),
  }
});
const client = new ApolloClient({
  cache,
  link,
  resolvers: {},
  
});

const IS_LOGGED_IN_QUERY = gql`
query{
  isLoggedIn @client
}
`

ReactDOM.render(
<ApolloProvider client={client}>
<Query query={IS_LOGGED_IN_QUERY}>
{({data}) => 
data.isLoggedIn ?<Root /> :<Auth/>}
</Query>

</ApolloProvider>, document.getElementById("root"));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
