import { getType } from 'typesafe-actions';
import * as actions from '../actions';
import { initEntityState, entityLoadingStarted, entityLoadingSucceeded, entityLoadingFailed } from '../utils';
import isEmpty from "../../validation/isEmpty";

export const defaultState = {
  authorList: initEntityState(null),
  authorRanking: initEntityState(null),
  isAuthorizedUser : false,
  currentUser : {},
};

const states = (state = defaultState, action) => {
  switch (action.type) {
    
    case getType(actions.getAuthorList.request):
      return { ...state, authorList: entityLoadingStarted(state.authorList, action.payload) };
    case getType(actions.getAuthorList.success):
      return { ...state, authorList: entityLoadingSucceeded(state.authorList, action.payload) };
    case getType(actions.getAuthorList.failure):
      return { ...state, authorList: entityLoadingFailed(state.authorList) };
    
      case getType(actions.getAuthorRanking.request):
      return { ...state, authorRanking: entityLoadingStarted(state.authorRanking, action.payload) };
    case getType(actions.getAuthorRanking.success):
      return { ...state, authorRanking: entityLoadingSucceeded(state.authorRanking, action.payload) };
    case getType(actions.getAuthorRanking.failure):
      return { ...state, authorRanking: entityLoadingFailed(state.authorRanking) };

    case actions.SET_AUTHOR_APROVED:
      if(!isEmpty(state.authorList.data.docs))
      {  
        state.authorList.data.docs.forEach(author =>{
          if(author._id === action.payload.authorId)
          {
            author.aproved = action.payload.aproved;
          }
        })
      }
      return state;

    case actions.SET_MINTING_FEE:
      if(!isEmpty(state.authorList.data.docs))
      {
        if(!isEmpty(action.payload.selectedIds))
        {
          state.authorList.data.docs.forEach(author =>{
            action.payload.selectedIds.forEach(authorId =>{
              if(author._id === authorId) {
                author.minting_fee = action.payload.mintingFee;
              }
            })
          })
        }
      }
      return state;

    case actions.SET_SELLING_FEE:
      if(!isEmpty(state.authorList.data.docs))
      {
        if(!isEmpty(action.payload.selectedIds))
        {
          state.authorList.data.docs.forEach(author =>{
            action.payload.selectedIds.forEach(authorId =>{
              if(author._id === authorId) {
                author.selling_fee = action.payload.sellingFee;
              }
            })
          })
        }
      }
      return state;    
    case actions.SET_CURRENT_USER:
      // console.log("actions.SET_CURRENT_USER", action.payload);
      return {
        ...state,
        isAuthorizedUser : !isEmpty(action.payload.userInfo),
        currentUser: action.payload.userInfo,
      }
      
    default:
      return state;
  }
};

export default states;
