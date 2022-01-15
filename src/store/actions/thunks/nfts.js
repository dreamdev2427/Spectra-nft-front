import { Axios, Canceler } from '../../../core/axios';
import * as actions from '../../actions';
import api from '../../../core/api';
import { approveForResell, mintNFT, mintBatchNFT } from "../../../core/nft/interact";

export const fillNftsBreakdown = (nfts) => async(dispatch) =>
{
  dispatch({
    type : actions.SET_NFT_BREAKDOWN_DATA,
    payload : nfts
  })
}

export const fetchNftsBreakdown = (authorId, situation, limit=0, start=0) => async (dispatch, getState) => {
  
  //access the state
  // const state = getState();
  // console.log(state);

  dispatch(actions.getNftBreakdown.request(Canceler.cancel));

  try {
    let filter = "";
    let addOptions = "";
    if(authorId !== "" && authorId !== undefined && authorId !== null) 
    {
      if(addOptions === "") addOptions = `author=${authorId}`;      
      else addOptions += `&author=${authorId}`;
    }    
    if(situation !== "" && situation !== undefined && situation !== null) 
    {
      if(addOptions === "") addOptions = `situation=${situation}`;
      else addOptions += `&situation=${situation}`;
    }
    if(limit !== 0)
    { 
      if(addOptions === "")  addOptions = `_limit=${limit}`;
      else  addOptions += `&_limit=${limit}`;
    }
    if(start !== 0)
    { 
      if(addOptions === "")  addOptions = `_start=${start}`;
      else  addOptions += `&_start=${start}`;
    }
    if(addOptions !== "") filter += addOptions;

    const { data } = await Axios.get(`${api.baseUrl}${api.nfts}?${filter}`, {
      cancelToken: Canceler.token,
      params: {},
    });

    dispatch(actions.getNftBreakdown.success(data));
  } catch (err) {
    dispatch(actions.getNftBreakdown.failure(err));
  }
};

export const fetchNftShowcase = () => async (dispatch) => {

  dispatch(actions.getNftShowcase.request(Canceler.cancel));

  try {
    const { data } = await Axios.get(`${api.baseUrl}${api.nftShowcases}`, {
      cancelToken: Canceler.token,
      params: {},
    });

    dispatch(actions.getNftShowcase.success(data));
  } catch (err) {
    dispatch(actions.getNftShowcase.failure(err));
  }
};

export const fetchNftDetail = (nftId) => async (dispatch) => {

  dispatch(actions.getNftDetail.request(Canceler.cancel));

  try {
    const { data } = await Axios.get(`${api.baseUrl}${api.nfts}/${nftId}`, {
      cancelToken: Canceler.token,
      params: {},
    });

    dispatch(actions.getNftDetail.success(data));
  } catch (err) {
    dispatch(actions.getNftDetail.failure(err));
  }
};

export const reselllingNFTAction = async (formData, nftId, nft_token_uri) => {
    const res = await approveForResell(formData.author_info, nft_token_uri, formData.token_type, formData.price, formData.deadline, formData.royalties);
    if (res.success) {
      const { data } = await Axios.put(`${api.baseUrl}${api.nfts}/${nftId}`, formData, {
        cancelToken: Canceler.token,
        params: {},
      });
      return {
        success: true,
        data
      }
    } else {
      return {
        success: false,
        status: res.status
      }
    }
}

export const getRemainDeadline = async (nftId = null) => {
  if(nftId === null ) return 0;
  const {data} = await Axios.get(`${api.baseUrl}/remain_deadline/${nftId}`, {}, {
    cancelToken: Canceler.token,
    params: {},
  });
  return data;
}

export const createSingleNft = async (formData) => {
  const result = await mintNFT (formData);
  if (result.success) {
    formData.unique_id = result.imageURI;
    formData.token_uri = result.tokenURI;
  } else {
    return {
      success: false,
      status: result.status
    }
  }
  var formImageData = new FormData();
  formImageData.append('files', formData.preview_image, formData.preview_image.name)
  await Axios.post(`${api.baseUrl}/upload`, formImageData,
    {          
    enctype: 'multipart/form-data',
    headers: {
      "Content-Type" : formData.preview_image.type,
      "Authorization": "Bearer "+localStorage.getItem("jwtToken") , // <- Don't forget Authorization header if you are using it.
    },
  }).then((response) => {
    formData.preview_image = response.data[0].id;
  }).catch(function (error) {
    return {
      success: false,
      status: error
    }
  });
  try {
    await Axios.post(`${api.baseUrl}${api.nfts}`, formData, {
      cancelToken: Canceler.token,
      params: {},
    });

    return {
      success: true,
      status: result.status
    }
  } catch (error) {
    return {
      success: false,
      status: error
    }
  }
};

export const createMultipleNft = async (formData, files) => {
  try {
    if (files.length > 999) {
      return {
        success: false,
        error: `You can't mint more than 999.`
      }
    }
    let mint_res = await mintBatchNFT(formData, files);
    if (mint_res.success) {
      formData.unique_ids = mint_res.imageURIs;
      formData.token_uris = mint_res.tokenURIs;
    } else {
      return {
        success: false,
        status: mint_res.status
      }
    }
    const formImageData = new FormData();
    files.forEach((file, index)=>{
      formImageData.append("files", file);
    });
    let upload_data = [];
    try {
      const { data } = await Axios.post(`${api.baseUrl}/upload`, formImageData,
        {          
        enctype: 'multipart/form-data',
        headers: {
          "Content-Type" : "multipart/form-data",
          "Authorization": "Bearer "+localStorage.getItem("jwtToken") , // <- Don't forget Authorization header if you are using it.
        },
      });
      upload_data = data;
    } catch (error) {
      return {
        success: false,
        status: error.response.data.message
      }
    }
    
    let imageData = [];
    upload_data.forEach((value, index) => {
      imageData.push(value.id);
    });
    formData.item_type = 'bundles';
    formData.image_data = imageData;
    try {
      await Axios.post(`${api.baseUrl}${api.nfts}/multi`, formData, {
        cancelToken: Canceler.token,
        params: {},
      });
      return {
        success: true,
        status: mint_res.status
      }
    } catch (error) {
      return {
        success: false,
        status: error.response.data.message
      }
    }
  } catch (error) {
    return {
      success: false,
      status: error.response.data.message
    }
  }
};

export const mintedNft = async (nftId, tokenURI) => {
  try {
    const { data } = await Axios.put(`${api.baseUrl}${api.nfts}/${nftId}`,
    {"unique_id": tokenURI, "situation" : "minted"},{
      cancelToken: Canceler.token,
      params: {},
    });
    return {
      success: true,
      data
    }
  } catch (error) {
    return {
      success: false,
      error
    }
  } 
};

export const totalCountOfNFTs = (nftSituation, nftCategory, nftItemType, nftStatus, nftTitle) => async (dispatch) =>
{  
  let addOptions = "";
  if (nftSituation !== "" && nftSituation !== undefined && nftSituation !== null) {
    if (addOptions === "") addOptions = `situation=${nftSituation}`;
    else addOptions += `&situation=${nftSituation}`;
  }
  if (nftStatus !== "" && nftStatus !== undefined && nftStatus !== null) {
    if (addOptions === "") addOptions = `status=${nftStatus}`;
    else addOptions += `&status=${nftStatus}`;
  }
  if (nftCategory !== "" && nftCategory !== undefined && nftCategory !== null) {
    if (addOptions === "") addOptions = `category=${nftCategory}`;
    else addOptions += `&category=${nftCategory}`;
  }
  if (nftItemType !== "" && nftItemType !== undefined && nftItemType !== null) {
    if (addOptions === "") addOptions = `item_type=${nftItemType}`;
    else addOptions += `&item_type=${nftItemType}`;
  }
  if (nftTitle !== "" && nftTitle !== undefined && nftTitle !== null) {
    if (addOptions === "") addOptions = `title=${nftTitle}`;
    else addOptions += `&title=${nftTitle}`;
  }
  var filter = (addOptions === "") ? "" : "?"+addOptions;

  await Axios.get(`${api.baseUrl}${api.nfts}/count${filter}`, 
    {}, {}
  ).then((response) => {
    dispatch( {
      type: actions.GET_TOTAL_COUNT_OF_NFTS,
      payload : response.data
    })
  }).catch(function (err) {
    console.log("error:", err);
  });
}

