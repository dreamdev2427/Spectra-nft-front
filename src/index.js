import React from 'react';
import ReactDOM from 'react-dom';
import "./assets/animated.css";
import '../node_modules/font-awesome/css/font-awesome.min.css'; 
import '../node_modules/elegant-icons/style.css';
import '../node_modules/et-line/style.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.js';
import './assets/style.scss';
import './assets/style_grey.scss';
import App from './components/app';
import * as serviceWorker from './serviceWorker';

import isEmpty from './validation/isEmpty';
import jwt_decode from "jwt-decode";
import Axios from 'axios';
import { cleanCurrentUser, setCurrentUserAction } from "./store/actions/thunks";
import api from "./core/api";
import { loadWeb3 } from "./core/nft/interact";

//redux store
import { Provider } from 'react-redux'
import store from './store';

const setCurrentUserInfoById = (userId) =>{ 
  let filter = userId ? '/'+userId : '';
  Axios.get(`${api.baseUrl}${api.users}${filter}`, {}, {
	headers: {
	  "Authorization": "Bearer "+localStorage.getItem("jwtToken") , // <- Don't forget Authorization header if you are using it.
	}
  })
  .then(function (response) {
	store.dispatch(setCurrentUserAction(response.data));
  })
  .catch(function (error) {
	// handle error
	console.log(error);
  })
  .then(function () {
	// always executed
  });
}  

  if(!isEmpty(localStorage.getItem("jwtToken")))
  {
	const decoded = jwt_decode(localStorage.getItem("jwtToken"));
	const currTime = Date.now() / 1000;
	if(decoded.app < currTime)
	{
	  store.dispatch(cleanCurrentUser());
	  localStorage.removeItem("jwtToken");
	}
	else{   
	  setCurrentUserInfoById(decoded.id);
	}
  }

  loadWeb3();

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>, 
	document.getElementById('root'));
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();