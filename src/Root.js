import React from "react";
import withRoot from "./withRoot";

import { BrowserRouter as Router, Switch, Route} from 'react-router-dom';

import { gql } from 'apollo-boost';
import { Query } from 'react-apollo';

import App from './pages/App';
import Profile from './pages/Profile';
import Header from './components/Shared/Header'
import Error from './components/Shared/Error'
import Loading from './components/Shared/Loading'

export const UserContext = React.createContext()

const Root = () => (
<Query query={ME_QUERY} fetchPolicy='cache-and-network'>
    {({data,loading,error}) => {
        if (loading) return <Loading />
        if (error) return <Error error={error}/>
        const currentUser = data.me
        return (
            <Router>
            <UserContext.Provider value={currentUser}>
            <Header currentUser={currentUser} />
            <Switch>
                <Route exact path="/" component={App} />
                <Route path="/profile/:id" component={Profile} />
                </Switch>
                </UserContext.Provider>
            
            </Router>
        )
    }}
</Query>
    )

export const ME_QUERY = gql`
{
    me {
        id
        username
        email
        likeSet{
            track{
                id
            }
        }
    }
}
`

//const GET_TRACKS_QUERY = gql`
//    {
//        tracks{
//            id
//            title
//            description
//            url
//        }
//    }
//`

export default withRoot(Root);
