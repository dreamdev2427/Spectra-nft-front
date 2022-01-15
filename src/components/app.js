import React from 'react';
import { Router, Location, Redirect } from '@reach/router';
import ScrollToTopBtn from './menu/ScrollToTop';
import Header from './menu/header';
import Home from './pages/home1';
import Explore from './pages/explore';
import Auction from './pages/Auction';
import ItemDetailRedux from './pages/ItemDetailRedux';
import Author from './pages/Author';
import Login from './pages/login';
import Register from './pages/register';
import Create2 from './pages/create2';
import Create3 from './pages/create3';
import Createoption from './pages/createOptions';
import FontAwesomeIcons from './pages/fontAwesomeIcons';
import Resell from "./pages/resell";

import { createGlobalStyle } from 'styled-components';
import MyProfile from './pages/MyProfile';
import EditProfile from './pages/EditProfile';
import { NotificationContainer } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

const GlobalStyles = createGlobalStyle`
  :root {
    scroll-behavior: unset;
  }
`;

export const ScrollTop = ({ children, location }) => {
  React.useEffect(() => window.scrollTo(0,0), [location])
  return children
}

const PosedRouter = ({ children }) => (
  <Location>
    {({ location }) => (
      <div id='routerhang'>
        <div key={location.key}>
          <Router location={location}>
            {children}
          </Router>
        </div>
      </div>
    )}
  </Location>
);

const app= () => (
  <div className="wraper">
  <GlobalStyles />
    <Header/>
      <PosedRouter>
      <ScrollTop path="/">
        <Home exact path="/">
          <Redirect to="/home" />
        </Home>
        <Explore path="/explore" />
        <Auction path="/Auction" />
        <ItemDetailRedux path="/ItemDetail/:nftId" />
        <Author path="/Author/:authorId" />
        <Login path="/login" />
        <Register path="/register" />
        <Create2 path="/create2" />
        <Create3 path="/create3" />
        <Createoption path="/createOptions" />
        <FontAwesomeIcons path="/fontAwesomeIcons" />
  		  <MyProfile path="/my_profile/:userId"/>
        <EditProfile path="/edit_profile/:uerid"/>
        <Resell path="/resell/:nftId"/>
        </ScrollTop>
      </PosedRouter>
    <ScrollToTopBtn />
    <NotificationContainer/>
  </div>
);
export default app;