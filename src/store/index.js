import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';

const store = createStore(rootReducer, composeWithDevTools(
    applyMiddleware(thunk)
    // other store enhancers if any
  ));

export default store;
