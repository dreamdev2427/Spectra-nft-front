import React, { memo, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as selectors from '../../store/selectors';
import { createGlobalStyle } from 'styled-components';
import NftCard from './NftCard';
import { totalCountOfNFTs } from '../../store/actions/thunks';
import api from '../../core/api';
import axios from 'axios';
import { fillNftsBreakdown } from '../../store/actions/thunks';

const GlobalStyles = createGlobalStyle`
    .de_countdown{
        position: relative;
        box-shadow: 0px 0px 8px 0px rgba(0,0,0,0.3);
        top: 0;
        left: 0;
        margin-bottom: 20px;
        div{
            display: flex;
            justify-content: center;
        }
        .Clock-days, .Clock-hours, .Clock-minutes{
            margin-right: 10px;
        }
    }
`;

const ColumnAuction = ({authorId="", situation="minted", status="on_auction", limit=20, start=0}) => {

    const dispatch = useDispatch();
    const totalCount = useSelector(selectors.nftTotalCount);
    const [nftList, setnftList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [noData, setNoData] = useState(false);

    useEffect(() => {
        dispatch(totalCountOfNFTs("minted", "", "", "on_auction", ""));
        loadMore();
    }, [dispatch])

    const [height, setHeight] = useState(0);
    const [page, setPage] = useState(0);

    const onImgLoad = ({target:img}) => {
        let currentHeight = height;
        if(currentHeight < img.offsetHeight) {
            setHeight(img.offsetHeight);
        }
    }
    
    const loadMore = async () =>
    {         
        try {
        setLoading(true);
          let url; let offset=0;
          if(page!=null & page > 0) 
          {        
            offset = page*4;
            if(offset > totalCount) 
            {
              setLoading(false);
              return setNoData(true);
            }
            url = api.baseUrl+api.nfts+ `?_start=${offset}&_limit=4&situation=minted&status=on_auction`;
          } 
          else { 
            if(page === 0) offset = 0;
            url = api.baseUrl+api.nfts+ `?_start=0&_limit=4&situation=minted&status=on_auction`;
          } 
          const response = await axios.get(url);
          var data = response.data;
          if (data === 0 ) setNoData(true);
          else {
            setNoData(false);
            const newPage = page + 1;

            const newList = nftList.concat(data);
            setnftList(newList);
            setPage(newPage);
            dispatch(fillNftsBreakdown(newList));
          }
          setLoading(false);
        } catch(error) {
          throw error;
        }
    }

  return (
    <div className='row'>
        <GlobalStyles />        
        {nftList && nftList.map((nft, index) => (
            <NftCard nft={nft} key={index} clockTop={false} onImgLoad={(img) => onImgLoad(img)} height={height} />
          ))
          }
        {loading ? <div className="text-center">Loading data ...</div> : ""}
        {noData ? <div className="text-center">No data anymore ...</div> : ""}
        {
            <div className='col-lg-12'>
                <div className="spacer-single"></div>
                <span onClick={() => loadMore()} className="btn-main lead m-auto">Load More</span>
            </div>
        }
    </div>              
    );
}

export default memo(ColumnAuction)