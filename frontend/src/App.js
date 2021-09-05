import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Login from './Pages/Login/Login';
import Register from './Pages/Register/Register';
import Dashboard from './Pages/Dashboard/Dashboard';

import AuthProvider from './Services/AuthProvider';

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql
} from "@apollo/client";

const client = new ApolloClient({
  uri: "/graphql",
  cache: new InMemoryCache()
});

export default function App() {
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <AuthProvider>
          <Router>
            <Switch>
              <Route path="/dashboard">
                <Dashboard />
              </Route>
              <Route path="/login">
                <Login />
              </Route>
              <Route path="/register">
                <Register />
              </Route>
              <Route path="/">
                <Login />
              </Route>
            </Switch>
          </Router>
        </AuthProvider>
      </div>
    </ApolloProvider>
  );
}
