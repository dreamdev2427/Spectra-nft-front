import React, { useState, useEffect } from "react";
import UserService from '../../services/nftService';
import NftCard from "./NftCard";
import { totalCountOfNFTs } from "../../store/actions/thunks";
import { useSelector, useDispatch } from "react-redux";
import * as selectors from '../../store/selectors';

const InfiniteScrollNoLibrary = ( ) => {

 const dispatch  = useDispatch();
  const [nftList, setnftList] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);
  const [height, setHeight] = useState(0);
  const  totalCount =  useSelector(selectors.nftTotalCount);

  window.onscroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop  === 
        document.documentElement.offsetHeight) 
    {
      if(!noData) {
        loadnftList(page, totalCount);
      }
    }
  }

  useEffect(() => {
    dispatch(totalCountOfNFTs());
  }, [dispatch]);

  const loadnftList = (page, totalCount) => {
    setLoading(true);
    setTimeout(() => {
      UserService.getList(page, totalCount)
        .then((data) => {
          const newPage = page + 1;

          const newList = nftList.concat(data);
          setnftList(newList);
          setPage(newPage);

          if(data.length === 0) setNoData(true);
          else setNoData(false);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() =>{
          setLoading(false);
        })
      }
    ,1000);
  }


  const onImgLoad = ({ target: img }) => {
      let currentHeight = height;
      if (currentHeight < img.offsetHeight) {
          setHeight(img.offsetHeight);
      }
  }

  return (
    <div>

      <div className="row">
        
        {nftList && nftList.map((nft, index) => (
                <NftCard nft={nft} key={index} onImgLoad={onImgLoad} height={height}  />
            ))
        }
        {loading ?  <div className="text-center">loading data ...</div> : "" }
        {noData ? <div className="text-center">no data anymore ...</div> : "" }    
      </div>
    </div>
  );
}

export default InfiniteScrollNoLibrary;
