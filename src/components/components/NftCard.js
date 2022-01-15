import React, { memo, useState } from 'react';
import styled from "styled-components";
import Clock from "./Clock";
import { navigate } from '@reach/router';
import api from '../../core/api';
import { useSelector } from 'react-redux';
import * as selectors from '../../store/selectors';

const Outer = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 8px;
`;

//react functional component
const NftCard = ({ nft, className = 'd-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4', clockTop = true, height, onImgLoad, authorId=null, situation=null  }) => {

    const [isEnded, setEnded] = useState(false);
    const currentUsr = useSelector(selectors.currentUser);

    const navigateTo = (link) => 
    {
        navigate(link);
    }     

    const checkAuctionStatus = (flag) => {
        setEnded(flag);       
    }
    return (
        <div className={className}>
            <div className="nft__item m-0">
            { nft && nft.item_type && nft.item_type === 'single_items' ? (
             <div className='icontype'><i className="fa fa-bookmark"></i></div>   
             ) : (  
             <div className='icontype'><i className="fa fa-shopping-basket"></i></div>
                )
            }
                { nft && nft.status === 'on_auction' && clockTop &&
                    <div className="de_countdown">
                        <Clock deadline={nft.deadline} nftId={nft.id} checkAuctionStatus={checkAuctionStatus} />
                    </div>
                }
                <div className="author_list_pp">
                    <span onClick={()=> navigateTo(nft && nft.author_link && nft.author  && nft.author.id &&  `${nft.author_link}/${nft.author.id}`)}>                                    
                        <img className="lazy" src={(nft && nft.author && nft.author.avatar ? api.baseUrl + nft.author.avatar.url : `${window.location.origin}/img/avatar.jpg`)} alt=""/>
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
                { nft && nft.status === 'on_auction' && !clockTop &&
                    <div className="de_countdown">
                        <Clock deadline={nft.deadline} nftId={nft.id} checkAuctionStatus={checkAuctionStatus}  />
                    </div>
                }
                <div className="nft__item_info">
                    <span onClick={() => situation !== "saled" ? navigateTo(nft && `${nft.nft_link}/${nft.id}`) : ''}>
                        <h4>{nft && nft.title}</h4>
                    </span>
                    { nft && (nft.status === 'has_offers' || nft.status === 'on_auction') ? (
                            <div className="has_offers">
                                <span className='through'><img src='/img/binance_20.webp' alt="" style={{width: 'auto'}}></img> {nft && nft.priceover && nft.priceover}</span> {nft.bids && nft.bids[0] && nft.bids[0].value ? nft.bids[0].value : nft.priceover} {nft.token_type}
                                <span style={{position:'absolute', right: '20px'}}>{nft && nft.bids && nft.bids.length}/{nft && nft.max_bid}</span>
                            </div> 
                        ) : (
                            <div className="nft__item_price">
                               <img src='/img/binance_20.webp' alt="" style={{width: 'auto'}}></img> {nft.status === 'buy_now'? nft.price : nft.priceover} {nft && nft.token_type}
                            </div>
                        )
                    }
                    <div className="nft__item_action">
                        {
                            nft && situation !=="saled" && (situation === null || situation === "minted") && nft.id &&
                                (<span onClick={() => navigateTo(`${nft.bid_link}/${nft.id}`)}>
                                    {   
                                        (currentUsr && currentUsr.author && nft.author && nft.author.id === currentUsr.author.id) ? (<span style={{color: 'red'}}>Yours</span>) :
                                        (isEnded && nft.status === 'on_auction') ? (<div>&nbsp;</div>) :
                                        (nft.status !== 'buy_now') ? 'Place a bid' :
                                        (nft.status === 'buy_now') ? 'Buy Now' : ''
                                    }
                                </span>)
                        }
                        {
                            authorId && situation === "saled" && nft && (currentUsr && currentUsr.role && (currentUsr.role.name === "Reseller" || currentUsr.role.name === "Creator" )) && 
                            (<span onClick={() => navigateTo(`/resell/${nft.id}`)}>Resell</span>)
                        }
                    </div>                   
                </div> 
            </div>         
        </div>             
    );
};

export default memo(NftCard);