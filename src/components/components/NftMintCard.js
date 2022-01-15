import React, { memo, useState } from 'react';
import styled from "styled-components";
import Clock from "./Clock";
import { navigate } from '@reach/router';
import api from '../../core/api';

const Outer = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 8px;
`;

//react functional component
const NftMintCard = ({ nft, className = 'd-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4', clockTop = true, height, onImgLoad, onSelectNft }) => {

    const [isEnded, setEnded] = useState(false);
    const navigateTo = (link) => {
        navigate(link);
    }

    const checkAuctionStatus = async (flag) => {
        setEnded(flag);       
    }

    return (
        <div className={className}>
            <div className="nft__item m-0">
            { nft.item_type === 'single_items' ? (
             <div className='icontype'><i className="fa fa-bookmark"></i></div>   
             ) : (  
             <div className='icontype'><i className="fa fa-shopping-basket"></i></div>
                )
            }
                <div className="author_list_pp">
                    <span onClick={()=> navigateTo(`${nft.author_link}/${nft.author.id}`)}>                                    
                        <img className="lazy" src={(nft.author && nft.author.avatar ? api.baseUrl + nft.author.avatar.url : `${window.location.origin}/img/avatar.jpg`)} alt=""/>
                        <i className="fa fa-check"></i>
                    </span>
                </div>
                <div className="nft__item_wrap" style={{height: `${height}px`}}>
                <Outer>
                    <span>
                        <img onLoad={onImgLoad} src={(nft && nft.unique_id ? nft.unique_id: '')} className="lazy nft__item_preview" alt=""/>
                    </span>
                </Outer>
                </div>
                { !isEnded && nft.deadline && !clockTop &&
                    <div className="de_countdown">
                        <Clock deadline={nft.deadline} checkAuctionStatus={checkAuctionStatus}/>
                    </div>
                }
                <div className="nft__item_info">
                    <span onClick={() => navigateTo(`${nft.nft_link}/${nft.id}`)}>
                        <h4>{nft.title}</h4>
                        <span>{nft.price} {nft.token_type}</span>
                    </span>
                    <div className="nft__item_action">
                        <span onClick={() => onSelectNft(nft)}>Select</span>
                    </div>
                    <div className="nft__item_like">
                        <span></span>
                    </div>                            
                </div> 
            </div>
        </div>             
    );
};

export default memo(NftMintCard);