import React, { useEffect, useState } from "react";
import Breakpoint, { BreakpointProvider, setDefaultBreakpoints } from "react-socks";
import { navigate } from '@reach/router';
import { Link } from '@reach/router';
import useOnclickOutside from "react-cool-onclickoutside";
import { useSelector, useDispatch } from "react-redux";
import * as selectors from '../../store/selectors';
import { logOutUserAction } from "../../store/actions/thunks";
import {NotificationManager} from 'react-notifications';
import api from "../../core/api";
import { getCurrentWallet, connectWallet } from "../../core/nft/interact";

setDefaultBreakpoints([
  { xs: 0 },
  { l: 1199 },
  { xl: 1200 }
]);

const NavLink = props => (
  <Link 
    {...props}
  />
);

const Header= function() {
    
    const closeMenu = () => {
    };
    
    const [showmenu, btn_icon] = useState(false);
    const [showpop, btn_icon_pop] = useState(false);

    const [walletAddress, setWallet] = useState("");
    const [walletBalance, setBalance] = useState("");

    const closePop = () => {
      btn_icon_pop(false);
    };
    const refpop = useOnclickOutside(() => {
      closePop();
    });

  const dispatch = useDispatch();
  const currentUsr = useSelector(selectors.currentUser);
  const isAuthorized = useSelector(selectors.isAuthorized);  

  const handleGotoMyProfile = () => {      
    navigate(`/my_profile/${currentUsr.id}`);
  }
  
  const handleGotoEditProfile = () => {
    navigate(`/edit_profile/${currentUsr.id}`);
  }

  useEffect(() => {
    async function getExistingWallet() {
      const {account, balance} = await getCurrentWallet();
      setWallet(account);
      setBalance(balance);
      addWalletListener();
    }

    getExistingWallet();

    const header = document.getElementById("myHeader");
    const totop = document.getElementById("scroll-to-top");
    const sticky = header.offsetTop;
    const scrollCallBack = window.addEventListener("scroll", () => {
      btn_icon(false);
      if (window.pageYOffset > sticky) {
        header.classList.add("sticky");
        totop.classList.add("show");

      } else {
        header.classList.remove("sticky");
        totop.classList.remove("show");
      } if (window.pageYOffset > sticky) {
        closeMenu();
      }
    });
    return () => {
      window.removeEventListener("scroll", scrollCallBack);
    };

  }, [dispatch]);

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", async (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          let accountBalance = await window.web3.eth.getBalance(accounts[0]);
          accountBalance = window.web3.utils.fromWei(accountBalance);
          setBalance(accountBalance);
        } else {
          setWallet("");
        }
      });
      window.ethereum.on("connect", async (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          let accountBalance = await window.web3.eth.getBalance(accounts[0]);
          accountBalance = window.web3.utils.fromWei(accountBalance);
          setBalance(accountBalance);
        } else {
          setWallet("");
        }
      });
    }
  }

  const onSignOutHandler = async () => {
    setWallet('');
    dispatch(logOutUserAction());
    NotificationManager.success("Successfully sign out.", "Success");
    //move to home page 
    navigate('/home');
  }

  const onConnectWallet = async () => {
    if (!isAuthorized) {
      navigate('/login');
      return;
    } else {
      await connectWallet();
    }
  }
  
  return (
    <header id="myHeader" className='navbar white'>
     <div className='container'>
       <div className='row w-100-nav'>
          <div className='logo px-0'>
              <div className='navbar-title navbar-item'>
                <NavLink to="/">
                <img
                  src={`${window.location.origin}/img/Spectra_logo.png`}
                  className="img-fluid d-none"
                  alt="#"
                />
                <img
                  src={`${window.location.origin}/img/Spectra_logo.png`}
                  className="img-fluid d-3"
                  alt="#"
                />
                <img
                  src={`${window.location.origin}/img/Spectra_logo_mark_only.png`}
                  className="img-fluid d-4"
                  alt="#"
                />
                <img
                  src={`${window.location.origin}/img/Spectra_logo_light.png`}
                  className="img-fluid d-block"
                  alt="#"
                />
              </NavLink>
            </div>
          </div>

          <div className='search'>
            <input id="quick_search" className="xs-hide" name="quick_search" placeholder="search item here..." type="text" />
          </div>
                    
              <BreakpointProvider>
                <Breakpoint l down>
                  {showmenu && 
                  <div className='menu'>
                    <div className='navbar-item' onClick={() => btn_icon(!showmenu)}>
                      <NavLink to="/home"> Home </NavLink>
                    </div>
                    <div className='navbar-item' onClick={() => btn_icon(!showmenu)}>
                      <NavLink to="/explore"> Explore </NavLink>
                    </div>
                    <div className='navbar-item' onClick={() => btn_icon(!showmenu)}>
                      <NavLink to="/Auction"> Live Auction </NavLink>
                    </div>
                    <div className='navbar-item' onClick={() => btn_icon(!showmenu)}>
                      <NavLink to={currentUsr && currentUsr.author && currentUsr.author.id ? `/Author/${currentUsr.author.id}` : '/Author/1' } > Collection </NavLink>
                    </div>
                    { isAuthorized && (
                      <div className='navbar-item' onClick={() => btn_icon(!showmenu)}>
                        <NavLink to="/createOptions"> Create </NavLink>
                      </div>
                    )}
                  </div>
                  }
                </Breakpoint>

                <Breakpoint xl>
                  <div className='menu'>
                    <div className='navbar-item' onClick={() => btn_icon(!showmenu)}>
                      <NavLink to="/home"> Home <span className='lines'></span></NavLink>
                    </div>
                    <div className='navbar-item' onClick={() => btn_icon(!showmenu)}>
                      <NavLink to="/explore"> Explore <span className='lines'></span></NavLink>
                    </div>
                    <div className='navbar-item' onClick={() => btn_icon(!showmenu)}>
                      <NavLink to="/Auction"> Live Auction <span className='lines'></span></NavLink>
                    </div>
                    <div className='navbar-item' onClick={() => btn_icon(!showmenu)}>
                      <NavLink to={currentUsr && currentUsr.author && currentUsr.author.id ? `/Author/${currentUsr.author.id}` : '/Author/1' }> Collection <span className='lines'></span></NavLink>
                    </div>
                    { isAuthorized && (
                      <div className='navbar-item' onClick={() => btn_icon(!showmenu)}>
                        <NavLink to="/createOptions"> Create <span className='lines'></span></NavLink>
                      </div>
                    )}
                  </div>
                </Breakpoint>
              </BreakpointProvider>

          <div className='mainside'>
            <div className="logout">
            { isAuthorized && !walletAddress && (
              <div className='connect-wal'>
                <button onClick={() => onConnectWallet()}>Connect Wallet</button>
            </div>
            )}
            { !isAuthorized && (
              <NavLink to="/login">Sign In</NavLink>
            )}
            { isAuthorized && walletAddress && currentUsr && (
              <div id="de-click-menu-profile" className="de-menu-profile" onClick={() => btn_icon_pop(!showpop)} ref={refpop}>
                <img src={(currentUsr && currentUsr.author && currentUsr.author.avatar && currentUsr.author.avatar.url ? (api.baseUrl + currentUsr.author.avatar.url) : `${window.location.origin}/img/avatar.jpg`)} alt="" /> 
                {currentUsr && isAuthorized &&  showpop &&
                  <div className="popshow">
                    {currentUsr.username && (
                      <div className="d-name">
                        <h4>{currentUsr.name}</h4>
                        <span className="name" onClick={() => window.open("", "_self")}>{currentUsr.username}</span>
                      </div>
                    )}
                    <div className="d-balance">
                      <h4>Balance</h4>
                      {walletBalance} BNB
                    </div>
                    <div className="d-wallet">
                      <h4>My Wallet</h4>
                      <span id="wallet" className="d-wallet-address">{walletAddress}</span>
                      <button id="btn_copy" title="Copy Text">Copy</button>
                    </div>
                    <div className="d-line"></div>
                    <ul className="de-submenu-profile">
                      <li onClick={() => handleGotoMyProfile()}>
                        <span>
                          <i className="fa fa-user"></i> My profile
                        </span>
                      </li>
                      <li onClick={() => handleGotoEditProfile()}>
                        <span>
                          <i className="fa fa-pencil"></i> Edit profile
                        </span>
                      </li>
                      <li onClick={() => onSignOutHandler()} >
                        <span>
                          <i className="fa fa-sign-out"  ></i> Sign out
                        </span>
                      </li>
                    </ul>
                  </div>
                }
              </div>
            )}
            </div>
          </div>

        </div>

        <button className="nav-icon" onClick={() => btn_icon(!showmenu)}>
          <div className="menu-line white"></div>
          <div className="menu-line1 white"></div>
          <div className="menu-line2 white"></div>
        </button>

      </div>     
    </header>
    );
}
export default Header;