import React, { memo, useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import Clock from "../components/Clock";
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import * as selectors from '../../store/selectors';
import { fetchNftDetail } from "../../store/actions/thunks";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import api from "../../core/api";
import moment from "moment";
import { NotificationManager } from 'react-notifications';
import Axios from "axios";
import { navigate } from "@reach/router";
import $ from "jquery";
import {
	getCurrentWallet,
	buyNFT, sellNFT, 
	connectWallet,
	placeBid,
	destroySale,
} from "../../core/nft/interact";
import { useRef } from "react";

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.white {
    background: #fff;
    border-bottom: solid 1px #dddddd;
  }
  .mr40{
    margin-right: 40px;
  }
  .mr15{
    margin-right: 15px;
  }
  .btn2{
    background: #f6f6f6;
    color: #8364E2 !important;
  }
  @media only screen and (max-width: 1199px) {
    .navbar{
      background: #403f83;
    }
    .navbar .menu-line, .navbar .menu-line1, .navbar .menu-line2{
      background: #111;
    }
    .item-dropdown .dropdown a{
      color: #111 !important;
    }
  }
`;

const ItemDetailRedux = ({ nftId }) => {

	const curUser = useSelector(selectors.currentUser);
	const [highestPastBidValue, setHighestPastBidValue] = useState(0);
	const [bidJustStarted, setBidJustStarted] = useState(false);
	const [openMenu0, setOpenMenu0] = React.useState(true);
	const [openMenu, setOpenMenu] = React.useState(false);
	const [openMenu1, setOpenMenu1] = React.useState(false);
	const [loading, setLoading] = useState(false);
	const isScreenMounted = useRef(true);
  
	useEffect(() => {
		return () =>  isScreenMounted.current = false
	},[])

	const handleBtnClick0 = () => {
		setOpenMenu0(!openMenu0);
		setOpenMenu(false);
		setOpenMenu1(false);
		document.getElementById("Mainbtn0").classList.add("active");
		document.getElementById("Mainbtn").classList.remove("active");
		document.getElementById("Mainbtn1").classList.remove("active");
	};
	const handleBtnClick = () => {
		setOpenMenu(!openMenu);
		setOpenMenu1(false);
		setOpenMenu0(false);
		document.getElementById("Mainbtn").classList.add("active");
		document.getElementById("Mainbtn1").classList.remove("active");
		document.getElementById("Mainbtn0").classList.remove("active");
	};
	const handleBtnClick1 = () => {
		setOpenMenu1(!openMenu1);
		setOpenMenu(false);
		setOpenMenu0(false);
		document.getElementById("Mainbtn1").classList.add("active");
		document.getElementById("Mainbtn").classList.remove("active");
		document.getElementById("Mainbtn0").classList.remove("active");
	};

	const handleBuynowBtnClick = async () => {
		//by web3, read balance of customer and set it to balance variable
		setLoading(true);
		const result = await getCurrentWallet();
		setLoading(false);
		if (result.success) {
			setBalanceOfCustomer(result.balance);
			setOpenCheckoutBuynowDlg(true);
		}
	}

	const handleCancelBuynowBtnClick = async () => {
		
		setLoading(true);	
		let result = await destroySale(nft.token_uri);
		if (result.success) {
			NotificationManager.success("Auction canceled.", "Success");
			setLoading(false);	
		} else {
			NotificationManager.error(result.status, "Error");
			setLoading(false);	
			return;
		}	
		//in CMS chage this NFT 's status to normal
		await Axios.put(`${api.baseUrl}${api.nfts}/${nft.id}`, {"status" : "normal", "deadline" : null, "situation":"saled" }, {}
		).catch(err => {
			NotificationManager.error("Error is on canceling offering.", "Error");
			return;
		});
		navigate("/explore");
		
	}

	const handlePlaceBidBtnClick = async (nft) => {
		//by web3, read balance of customer and set it to balance variable
		setLoading(true);
		const result = await getCurrentWallet();
		if (result.success) {
			setBalanceOfCustomer(result.balance);
			//get highest bid's value
			var hBidVal = nft.priceover;
			hBidVal = nft.bids && nft.bids[0] && nft.bids[0].value ? nft.bids[0].value : nft.priceover;
			if (!nft.bids || !nft.bids[0] || !nft.bids[0].value) setBidJustStarted(true);
			else setBidJustStarted(false);
			setHighestPastBidValue(hBidVal);
			
			if(nft && nft.status && nft.status === "has_offers")
			{
				if(nft.bids && nft.bids.length && nft.max_bid && nft.bids.length>nft.max_bid ) 
				{
					NotificationManager.warnig("Bidding is over", "Warning");
					setLoading(false);
					return;
				}				
			}
			setOpenCheckoutForBidDlg(true);
		} else {
			await connectWallet();
		}
		setLoading(false);
	}

	const handlerOnCheckoutBuynow = async (nft) => {
		setOpenCheckoutBuynowDlg(false);
		/*check wether customer has enough balance to buy this or not *////
		if (balanceOfCustomer < nft.price) {
			//trigger toast and return
			NotificationManager.warning("You havn't enough balance.", "Warning");
			return;
		}
		else if (nft.author.id === curUser.author.id) {
			NotificationManager.error("Cannot sell by self", "Error");
			return;
		}
		else {
			//?*change the NFT's ownership between customer and author in web3, and transfer NFT's price in web3  *///
			setLoading(true);
			let result;
			if(nft.bids[0] !== undefined)  {
				result = await placeBid(nft, nft.bids[0].value);	
			} else {
				result = await placeBid(nft, nft.price);	
			}
			if (!result.success) {
				NotificationManager.error(result.status, "Error");
				return;
			}
			result = await buyNFT(nft, curUser, nft.price);
			if (result.success) {
				dispatch(fetchNftDetail(nftId));
				NotificationManager.success(result.status, "Success");
				setLoading(false);
				const authorId = curUser && curUser.author ? curUser.author.id : 1;
        		navigate(`/Author/${authorId}`);
			} else {
				NotificationManager.error(result.status, "Error", 10000);
				setLoading(false);
				return;
			}
			return {
				success: true,
				status:
					"Check out your transaction on Etherscan."
			};
		}
	}

	const handlerOnCheckoutBid = async (nft) => {
		setOpenCheckoutForBidDlg(false);
		var biddedPrice = $("#bidPrice").val();
		if (biddedPrice < highestPastBidValue) {
			if (bidJustStarted === true) {
				NotificationManager.warning("Bid with higher or equal price than NFT's price.", "Warning");
				return;
			}
		}
		if (biddedPrice <= highestPastBidValue && bidJustStarted === false) 
		{
			NotificationManager.warning("Bid with higher price than previous one.", "Warning");
			return;
		}
		if (balanceOfCustomer < biddedPrice) 
		{
			//trigger toast and return
			NotificationManager.warning("You have not enough balance.", "Warning");
			return;
		}
		else if (nft.author.id === curUser.author.id) 
		{
			NotificationManager.error("Cannot sell by self", "Error");
			return;
		}
		else {
			//place a bid for the NFT
			var onSaleNft = nft;
			var newBid = { "author": curUser.author.id, "nft": onSaleNft.id, "value": biddedPrice };
			if(nft && nft.status && nft.status === "has_offers")
			{
				console.log("[wts - handlerOnCheckoutBid] : nft.bids.length = ", nft.bids.length);
				if((nft.max_bid && nft.bids.length && nft.bids.length<nft.max_bid) || !nft.bids.length )
				{
					console.log("[wts - handlerOnCheckoutBid] : nft.bids.length = ", nft.bids.length);
					setLoading(true);
					let result;
					result = await placeBid(nft, biddedPrice);	
					if (result.success) {							
						NotificationManager.success("You've bid to it.", "Success");
					}else {
						NotificationManager.error(result.status, "Error");
						setLoading(false);
						return;
					}
					//add a new bid to CMS
					await Axios.post(`${api.baseUrl}${api.bids}`, newBid, {}
					).catch(err => {
						NotificationManager.error("Error is on NFT's bid list.", "Error");
						setLoading(false);
						return;
					});
					dispatch(fetchNftDetail(nftId));
					setLoading(false);	
										
					if(nft.bids.length + 1 >= nft.max_bid)
					{
						NotificationManager.success("You win. Please wait until change ownership.", "Success");
						setLoading(true);
						result = await buyNFT(nft, curUser, biddedPrice);
						
						if (result.success) {
							NotificationManager.success(result.status, "Success");
							setLoading(false);	
							const authorId = curUser && curUser.author ? curUser.author.id : 1;
							navigate(`/Author/${authorId}`);
						} else {
							NotificationManager.error(result.status, "Error", 10000);
							setLoading(false);	
							return;
						}
						return {
							success: true,
							status:
								"Check out your transaction on Etherscan."
						};						
					}
				}
			}
			else if(nft && nft.status && nft.status === "on_auction" )
			{
				setLoading(true);				
				let result;	
				console.log("biddedPrice = ", biddedPrice);
				result = await placeBid(nft, biddedPrice);
				if (result.success) 
				{	
					NotificationManager.success("You've bid to it.", "Success");
				}
				else {
					NotificationManager.error(result.status, "Error");
					setLoading(false);	
					return;
				}
				///*** add a new bid to CMS     *///
				await Axios.post(`${api.baseUrl}${api.bids}`, newBid, {}
				).catch(err => {
					NotificationManager.error("Error is on NFT's bid list.", "Error");
					setLoading(false);	
					return;
				});
				dispatch(fetchNftDetail(nftId))	;
				setLoading(false);			
			}	
			return;
		}
	}

 	const handlerSellAndFinishAuction = async (nft) =>
	 {
		var topBidder = {};
		if(nft.bids && nft.bids[0] && nft.bids[0].author) topBidder = nft.bids[0].author;
		else{
			NotificationManager.error("Can not find the top bidder info.", "Error");
			return;
		}
		if(topBidder && topBidder.wallet) 
		{			
			setLoading(true);
			let result;
			if(nft.bids[0] !== undefined) result = await sellNFT(nft, topBidder, nft.bids[0].value);
			else result = await sellNFT(nft, topBidder, nft.price);	
			setLoading(false);	
			if (result.success) {
				NotificationManager.success(result.status, "Success");
			} else {
				NotificationManager.error(result.status, "Error");
				return;
			}
			navigate(`/explore`);
		}
		else {
			NotificationManager.error("Top bidder has no wallet. So you can't sell to him", "Error");
			return;
		}
	}

	const handlerCancelLiveAuction = async (nft) => {
		setLoading(true);	
		let result = await destroySale(nft.token_uri);
		if (result.success) {
			NotificationManager.success("Auction canceled.", "Success");
			setLoading(false);	
		} else {
			NotificationManager.error(result.status, "Error");
			setLoading(false);	
			return;
		}	
		//in CMS chage this NFT 's status to normal
		await Axios.put(`${api.baseUrl}${api.nfts}/${nft.id}`, {"deadline" : null, "bids":[], "situation":"saled" }, {}
		).catch(err => {
			NotificationManager.error("Error is on canceling offering.", "Error");
			return;
		});
		navigate("/explore");
	}

	const handlerSellAndFinishOffering = async (nft) => {
		var topBidder = {};
		if(nft.bids && nft.bids[0] && nft.bids[0].author) topBidder = nft.bids[0].author;
		else{
			NotificationManager.error("Can not find the top bidder info.", "Error");
			return;
		}
		if(topBidder && topBidder.wallet) 
		{			
			setLoading(true);
			let result;			
			if(nft.bids[0] !== undefined) result = await sellNFT(nft, topBidder, nft.bids[0].value);
			else result = await sellNFT(nft, topBidder, nft.price);	
			setLoading(false);	
			if (result.success) {
				NotificationManager.success(result.status, "Success");
			} else {
				NotificationManager.error(result.status, "Error");
				return;
			}
			navigate(`/explore`);
		}
		else {
			NotificationManager.error("Top bidder has no wallet. So you can't sell to him", "Error");
			return;
		}
	}

	const handlerCancelOffering = async (nft) => {
		setLoading(true);	
		let result = await destroySale(nft.token_uri);
		if (result.success) {
			NotificationManager.success("Auction canceled.", "Success");
			setLoading(false);	
		} else {
			NotificationManager.error(result.status, "Error");
			setLoading(false);	
			return;
		}	
		//in CMS chage this NFT 's status to normal
		await Axios.put(`${api.baseUrl}${api.nfts}/${nft.id}`, {"bids": [], "situation":"saled", "deadline":null }, {}
		).catch(err => {
			NotificationManager.error("Error is on canceling offering.", "Error");
			return;
		});
		NotificationManager.success("Offering canceled.", "Success");
		navigate("/explore");
	}

	const dispatch = useDispatch();
	const [balanceOfCustomer, setBalanceOfCustomer] = useState(0);
	const nftDetailState = useSelector(selectors.nftDetailState);
	const nft = nftDetailState.data ? nftDetailState.data : [];
	const [isEnded, setEnded] = useState(false);

	const [openCheckout, setOpenCheckoutBuynowDlg] = React.useState(false);
	const [openCheckoutbid, setOpenCheckoutForBidDlg] = React.useState(false);

	useEffect(() => {
		if(!isScreenMounted.current) return;
		dispatch(fetchNftDetail(nftId));
	}, [dispatch, nftId]);

	const checkAuctionStatus = async (flag) => {
        setEnded(flag);       
    }

	return (
		<div>
			<GlobalStyles />
			<section className='container'>
				<div className='row mt-md-5 pt-md-4'>
					<div className="col-md-6 text-center">
						<img src={(nft && nft.unique_id ? nft.unique_id: '')} className="img-fluid img-rounded mb-sm-30" alt="" />
					</div>
					<div className="col-md-6">
						<div className="item_info">
							{nft.status === 'on_auction' &&
								<div>
									<span >Auctions Status : </span>
									{ nft && nft.status === 'on_auction' && 
									<div className="de_countdown ">
										<Clock deadline={nft.deadline} nftId={nft.id} checkAuctionStatus={checkAuctionStatus}/>
									</div>
									}
								</div>
							}
							<h2>{nft.title}</h2>
							<span>Start Price</span>
							<h3><img src='/img/binance_20.webp' alt=""></img> {nft.status === 'buy_now' ? nft.price : nft.priceover} {nft.token_type}</h3>
							<div className="item_info_counts">
								<div className="item_info_type"><i className="fa fa-image"></i>{nft.category}</div>
								<div className="item_info_like"><i className="fa fa-heart"></i>{(nft && nft.bids && nft.bids.length ) && nft.bids.length}</div>
							</div>
							<div className="d-flex flex-row">
								<div className="mr40">
									<h6>Creator</h6>
									<div className="item_author">
										<div className="author_list_pp">
											<span>
												<img className="lazy" src={(nft.creator && nft.creator.avatar ? api.baseUrl + nft.creator.avatar.url : `${window.location.origin}/img/avatar.jpg`)} alt="" />
												<i className="fa fa-check"></i>
											</span>
										</div>
										<div className="author_list_info">
											<span>{nft.creator && nft.creator.username}</span>
										</div>
									</div>
								</div>
								<div className="mr40">
									<h6>Owner</h6>
									<div className="item_author">
										<div className="author_list_pp">
											<span>
												<img className="lazy" src={(nft.author && nft.author.avatar ? api.baseUrl + nft.author.avatar.url : `${window.location.origin}/img/avatar.jpg`)} alt="" />
												<i className="fa fa-check"></i>
											</span>
										</div>
										<div className="author_list_info">
											<span>{nft.author && nft.author.username}</span>
										</div>
									</div>
								</div>
							</div>

							<div className="spacer-40"></div>

							<div className="de_tab">

								<ul className="de_nav">
									<li id='Mainbtn0' className="active"><span onClick={handleBtnClick0}>Details</span></li>
									<li id='Mainbtn' ><span onClick={handleBtnClick}>Bids</span></li>
									<li id='Mainbtn1' className=''><span onClick={handleBtnClick1}>History</span></li>
								</ul>

								<div className="de_tab_content">
									{openMenu0 && (
										<div className="tab-1 onStep fadeIn">
											<div className="d-block mb-3">
												<div className="mr40">
													<span>{nft.description}</span>
												</div>
											</div>
										</div>
									)}

									{openMenu && (
										<div className="tab-1 onStep fadeIn">
											{
												nft.bids && nft.bids.map((bid, index) => (
													<div className="p_list" key={index}>
														<div className="p_list_pp">
															<span>
																<img className="lazy" src={bid && bid.author && bid.author.avatar ? api.baseUrl + bid.author.avatar.url : `${window.location.origin}/img/avatar.jpg`} alt="" />
																<i className="fa fa-check"></i>
															</span>
														</div>
														<div className="p_list_info">
															Bid {bid && bid.author && bid.author.id && bid.author.id === nft.author.id && 'accepted'} <b>{bid.value} {nft.token_type}</b>
															<span>by <b>{(bid.author && bid.author.username) &&
																bid.author.username
															}</b> at {moment(bid.created_at).format('L, LT')}</span>
														</div>
													</div>
												))
											}
										</div>
									)}

									{openMenu1 && (
										<div className="tab-2 onStep fadeIn">
											{nft.history && nft.history.map((bid, index) => (
												<div className="p_list" key={index}>
													<div className="p_list_pp">
														<span>
															<img className="lazy" src={bid && bid.author && bid.author.avatar ? api.baseUrl + bid.author.avatar.url : `${window.location.origin}/img/avatar.jpg`} alt="" />
															<i className="fa fa-check"></i>
														</span>
													</div>
													<div className="p_list_info">
														Bid {bid.author && bid.author.id && bid.author.id === nft.author.id && 'accepted'} <b>{bid.value} {nft.token_type}</b>
														<span>by <b>{bid.author && bid.author.username && bid.author.username}</b> at {moment(bid.created_at).format('L, LT')}</span>
													</div>
												</div>
											))}
										</div>
									)}
									{
										curUser.author && curUser.author.id && nft.author && nft.author.id &&
										<div className="d-flex flex-row mt-5">
											{
												(nft.status === "buy_now") && (nft.author.id !== curUser.author.id) ?
												<button className='btn-main lead mb-5 mr15' onClick={() => handleBuynowBtnClick()}>Buy Now</button>
												:
												<button className='btn-main lead mb-5 mr15' onClick={() => handleCancelBuynowBtnClick()}>Cancel</button>
											}
											{
												(nft.status === "on_auction") && (nft.author.id === curUser.author.id) && 
												<div className="row">
													{ !(nft.bids.length === 0  || nft.bids.length === undefined) && 
													<button className='btn-main lead mb-5 mr15 col-md-3' onClick={() => handlerSellAndFinishAuction(nft)}>Sell</button> }
													{ <button className='btn-main lead mb-5 mr15 col-md-3' onClick={() => handlerCancelLiveAuction(nft)}>Cancel</button> }
												</div>
											}
											{
												(nft.status === "has_offers") && (nft.author.id === curUser.author.id) && 
												<div className="row">
													{ 
														!(nft.bids.length === 0  || nft.bids.length === undefined) && 
														<button className='btn-main lead mb-5 mr15 col-md-3' onClick={() => handlerSellAndFinishOffering(nft)}>Sell</button> 
													}
													<button className='btn-main lead mb-5 mr15 col-md-3' onClick={() => handlerCancelOffering(nft)}>Cancel</button> 
												</div>
											}
											{
												(nft.status === "on_auction") && !isEnded && (nft.author.id !== curUser.author.id) && 
												<button className='btn-main lead mb-5 mr15' onClick={() => handlePlaceBidBtnClick(nft)}>Place a Bid</button>
											}
											{
												(nft.status === "has_offers") && (nft.author.id !== curUser.author.id) &&
												<button className='btn-main lead mb-5 mr15' onClick={() => handlePlaceBidBtnClick(nft)}>Place a Bid</button>
											}
										</div>
									}
								</div>
							</div>
						</div>
					</div>
				</div>
			{<Backdrop
              sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
              open={loading}
            >
              <CircularProgress color="inherit" />
            </Backdrop>}
			</section>
			<Footer />
			{openCheckout &&
				<div className='checkout'>
					<div className='maincheckout'>
						<button className='btn-close' onClick={() => setOpenCheckoutBuynowDlg(false)}>x</button>
						<div className='heading'>
							<h3>Checkout</h3>
						</div>
						<p>You are about to purchase a <span className="bold">{nft.title ? nft.title : ""}</span>
							<span>  from </span><span className="bold">{nft.author && (nft.author.username ? nft.author.username : "")}</span></p>
						<div className='heading mt-3'>
							<p>Your balance</p>
							<div className='subtotal'>
								{balanceOfCustomer}  {nft.token_type}
							</div>
						</div>
						<div className='heading'>
							<p>Service fee {nft.author && nft.author.selling_fee ? `${nft.author.selling_fee}%` : "0%"}</p>
							<div className='subtotal'>
								{nft.author && (nft.author.selling_fee && nft.price) ? `${nft.author.selling_fee * nft.price / 100.0} ${nft.token_type}` : `0 ${nft.token_type}`}
							</div>
						</div>
						<div className='heading'>
							<p>You will pay</p>
							<div className='subtotal'>
								{nft.price ? `${nft.price} ${nft.token_type}` : `0 ${nft.token_type}`}
							</div>
						</div>
						<button className='btn-main lead mb-5' onClick={() => handlerOnCheckoutBuynow(nft)} >Checkout</button>
					</div>
				</div>
			}
			{openCheckoutbid &&
				<div className='checkout'>
					<div className='maincheckout'>
						<button className='btn-close' onClick={() => setOpenCheckoutForBidDlg(false)}>x</button>
						<div className='heading'>
							<h3>Place a Bid</h3>
						</div>
						<p>You are about to purchase a <span className="bold">{nft.title ? nft.title : ""}</span>
							<span> from  </span><span className="bold">{nft.author && (nft.author.username ? nft.author.username : "")}</span></p>
						<div className='detailcheckout mt-4'>
							<div className='listcheckout'>
								<h6>
									Your bid ({nft.token_type})
								</h6>
								<input type="number" id="bidPrice" min={highestPastBidValue} step="0.001" defaultValue={highestPastBidValue} className="form-control" />
							</div>
						</div>
						<div className='heading mt-3'>
							<p>Your balance</p>
							<div className='subtotal'>
								{balanceOfCustomer} {nft.token_type}
							</div>
						</div>
						<div className='heading'>
							<p>Service fee {nft.author && nft.author.selling_fee ? `${nft.author.selling_fee}%` : "0%"}</p>
							<div className='subtotal'>
								{nft.author && (nft.author.selling_fee && nft.priceover) ? `${nft.author.selling_fee * nft.priceover / 100.0} ${nft.token_type}` : `0 ${nft.token_type}`}
							</div>
						</div>
						<button className='btn-main lead mb-5' onClick={() => handlerOnCheckoutBid(nft)} >Checkout</button>
					</div>
				</div>
			}

		</div>
	);
}

export default memo(ItemDetailRedux);
