import { Axios, Canceler } from '../../../core/axios';
import * as actions from '../../actions';
import api from '../../../core/api';

export const logOutUserAction =  () => async (dispatch) => {
  dispatch(cleanCurrentUser());
  localStorage.removeItem("jwtToken");
}

export const cleanCurrentUser = () => async(dispatch) =>{
  dispatch( {
    type: actions.SET_CURRENT_USER,
    payload : {}
  })
}

export const setCurrentUserAction = (userInfo) => async (dispatch) => {
  //try to send data to the mongodb, if succeed, then dispatch
  
    dispatch({
      type : actions.SET_CURRENT_USER,
      payload : {userInfo}
    })

}

export const regiserNewAuthorAction = ({name, email, username, phone, password, ...others}) => async(dispatch) =>{
  //try to send data to the mongodb, if succeed, then dispatch
 
  // dispatch({
  //   type : actions.CREATE_NEW_AUTHOR,
  //   payload : { name, email, username, phone, password, ...others}
  // })

  dispatch(fetchAuthorList());
}

export const setUserAproveFieldAction = (authorId, aproved) => async(dispatch) =>{
  //try to send data to the mongodb, if succeed, then dispatch

  dispatch({
    type: actions.SET_AUTHOR_APROVED,
    payload : {authorId, aproved}
  })
}

export const setSellingFeeAction = (selectedIds, sellingFee) => async (dispatch) => {
  //try to send data to the mongodb, if succeed, then dispatch

  dispatch({
    type : actions.SET_SELLING_FEE,
    payload : {selectedIds, sellingFee}
  })
  
}

export const setMintingFeeAction = (selectedIds, mintingFee) => async (dispatch) => {
  //try to send data to the mongodb, if succeed, then dispatch

  dispatch( {
    type : actions.SET_MINTING_FEE,
    payload : {selectedIds, mintingFee}
  })
  
}

export const fetchAuthorList = (authorId, limit) => async (dispatch) => {

  dispatch(actions.getAuthorList.request(Canceler.cancel));

  try {
    let filter = authorId ? '/'+authorId : ''; 
    if (limit !== "" && limit !== undefined && limit !== null && limit>0) {
      filter += `?_limit=${limit}`;
    }
    const { data } = await Axios.get(`${api.baseUrl}${api.authors}${filter}`, {
      cancelToken: Canceler.token,
      params: {},
    });

    dispatch(actions.getAuthorList.success(data));
  } catch (err) {
    dispatch(actions.getAuthorList.failure(err));
  }
};

export const fetchUserList = (userId) => async (dispatch) => {

  dispatch(actions.getAuthorList.request(Canceler.cancel));

  try {
    let filter = userId ? '/'+userId : '';
    const { data } = await Axios.get(`${api.baseUrl}${api.users}${filter}`, {
      cancelToken: Canceler.token,
      params: {},
    });

    dispatch(actions.getAuthorList.success(data));
    setCurrentUserAction(data);

  } catch (err) {
    dispatch(actions.getAuthorList.failure(err));
  }
};

export const fetchCurrentUser = (userId) => async (dispatch) => {

  dispatch(actions.getAuthorList.request(Canceler.cancel));

  try {
    let filter = userId ? '/'+userId : '';
    const { data } = await Axios.get(`${api.baseUrl}${api.users}${filter}`, {
      cancelToken: Canceler.token,
      params: {},
    });

    dispatch(actions.getAuthorList.success(data));
    setCurrentUserAction(data);

  } catch (err) {
    dispatch(actions.getAuthorList.failure(err));
  }
};

export const fetchAuthorRanking = () => async (dispatch) => {

  dispatch(actions.getAuthorRanking.request(Canceler.cancel));

  try {
    const { data } = await Axios.get(`${api.baseUrl}${api.authorsSales}`, {
      cancelToken: Canceler.token,
      params: {},
    });

    dispatch(actions.getAuthorRanking.success(data));
  } catch (err) {
    dispatch(actions.getAuthorRanking.failure(err));
  }
};
