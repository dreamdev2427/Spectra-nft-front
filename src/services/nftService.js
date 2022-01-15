import axios from 'axios';
import api from "../core/api";

const PAGE_LIMIT = 8;
const getList =  async (page, totalCount, addfilterOptions = "") =>
{
    try {
      let url; let offset=0;
      if(page!=null & page > 0) 
      {        
        offset = page*PAGE_LIMIT;
        if(offset > totalCount) {
          return 0;
        }
        if(addfilterOptions !== "") url = api.baseUrl+api.nfts+ `?_start=${offset}&_limit=${PAGE_LIMIT}&${addfilterOptions}`;
        else url = api.baseUrl+api.nfts+ `?_start=${offset}&_limit=${PAGE_LIMIT}`;
      } 
      else { 
        if(page === 0) offset = 0;
        if(addfilterOptions !== "")  url = api.baseUrl+api.nfts+ `?_start=0&_limit=${PAGE_LIMIT}&${addfilterOptions}`;
        else url = api.baseUrl+api.nfts+ `?_start=0&_limit=${PAGE_LIMIT}`;
      } 
      const response = await axios.get(url);
      return response.data;
    } catch(error) {
      throw error;
    }
  }

  export default getList;
