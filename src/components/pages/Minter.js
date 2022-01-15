import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from 'react-redux';
import swal from 'sweetalert';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import {NotificationManager} from 'react-notifications';
import { navigate } from '@reach/router';
import {
  connectWallet,
  getCurrentWalletConnected,
  mintNFT,
} from "../../core/nft/interact";
import { createGlobalStyle } from 'styled-components';
import ColumnNewMint from '../components/ColumnNewMint';
import { mintedNft  } from "../../store/actions/thunks";
import Footer from '../components/footer';
import * as selectors from '../../store/selectors';

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.sticky.white {
    background: #403f83;
    border-bottom: solid 1px #403f83;
  }
  header#myHeader.navbar .search #quick_search{
    color: #fff;
    background: rgba(255, 255, 255, .1);
  }
  header#myHeader.navbar.white .btn, .navbar.white a, .navbar.sticky.white a{
    color: #fff;
  }
  header#myHeader .dropdown-toggle::after{
    color: rgba(255, 255, 255, .5);
  }
  header#myHeader .logo .d-block{
    display: none !important;
  }
  header#myHeader .logo .d-none{
    display: block !important;
  }
  @media only screen and (max-width: 1199px) {
    .navbar{
      background: #403f83;
    }
    .navbar .menu-line, .navbar .menu-line1, .navbar .menu-line2{
      background: #fff;
    }
    .item-dropdown .dropdown a{
      color: #fff !important;
    }
  }
`;

const Minter = (props) => {
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");

  const [tokenID, setTokenID] = useState(0);
  const [name, setName] = useState("");
  const [isMinting, setisMinting] = useState(false);
  const currentUser = useSelector(selectors.currentUser);
  const isAuthorized = useSelector(selectors.isAuthorized);
 
  useEffect(() => {
    async function getExistingWallet() {
      const { address, status } = await getCurrentWalletConnected();

      setWallet(address);
      setStatus(status);

      addWalletListener();
    }
      
    getExistingWallet();

    if (!localStorage.getItem("jwtToken")) {
      swal({
        title: "Warning",
        text: "You can't mint. Please sign in!",
        icon: "warning",
      }).then(() => {
        navigate('/login');
        return;
    });
    }
  }, []);

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          // setStatus("Fill in the text-field above.");
        } else {
          setWallet("");
          setStatus("🦊 Connect to Metamask using the top right button.");
        }
      });
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a target="_blank" rel="noreferrer" href={`https://metamask.io/download.html`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      );
    }
  }

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    if(walletResponse.status) setStatus(walletResponse.status);
    if(walletResponse.address) setWallet(walletResponse.address);
  };

  const onMintPressed = async () => {
    setisMinting(true);
    
    if (!localStorage.getItem("jwtToken") || !currentUser) {
      swal({
        title: "Warning",
        text: "You can't mint. Please sign in!",
        icon: "warning",
      }).then(() => {
        localStorage.removeItem("jwtToken");
        navigate('/login');
        return;
    });
    }
    const mintRes = await mintNFT(tokenID, currentUser.author);
    setStatus(mintRes.status);
    if (mintRes.success) {
      const res = await mintedNft(tokenID, mintRes.tokenURI);
      if (res.success) {

        NotificationManager.success('Successfully minted NFT', 'Success');
      } else {
        NotificationManager.warning(res.error, 'Warning');
      }
      setTokenID(0);
      setName('');
    } else {
      NotificationManager.warning(mintRes.status, 'Warning');
    }
    setisMinting(false);
  };

  const onSelectNft = (nft) => {
    setTokenID(nft.id);
    setName(nft.title);
  }

  const isEmpty = useCallback(() => {
    return name.trim() === '' || tokenID === 0;
  }, [name, tokenID]);

  return (
    <div>
      <GlobalStyles />
      <section className='jumbotron breadcumb no-bg' style={{ backgroundImage: `url(${'./img/background/subheader.jpg'})` }}>
        <div className='mainbreadcumb'>
          <div className='container'>
            <div className='row m-10-hor'>
              <div className='col-12'>
                <h1 className='text-center'>NFT Minting</h1>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className='container'>
        <div className="Minter">
          <h1>Mint your NFT</h1>

          {walletAddress.length === 0 && (
            <button id="walletButton" className="btn-main" onClick={connectWalletPressed}>
              Connect Metamask
            </button>
          )}
          {walletAddress.length > 0 && (
            "Connected Address: " + walletAddress
          )}
          <br /><br />
          {walletAddress.length === 0 && (
            <p>
              connect to metamask to start minting
            </p>
          )}
          {isMinting ? (
            <h2>Minting in Process</h2>
          ) : (
            <div>
              {
                (!currentUser || (currentUser.role && currentUser.role.name === 'Public')) && (
                  <div className="alert alert-danger" role="alert"
                    dangerouslySetInnerHTML={{ __html: `You can't create NFT.<br/>You have no permission to create NFT. Please contact an manager.` }}>
                  </div>
                )
              }
              {isAuthorized && currentUser && currentUser.role && currentUser.role.name === 'Creator' &&
                walletAddress.length > 0 &&
                <>
                  <br />
                  {(
                    <ColumnNewMint onSelectNft={onSelectNft} showLoadMore={false} authorId={currentUser.author.id} />
                  )}
                  {!isEmpty() &&
                    <>
                      <span>NFT Name: {name}</span>
                      <br />
                      <br />
                      <button id="mintButton" className="btn-main" onClick={onMintPressed}>
                        Proceed to Mint
                      </button>
                      <br />
                    </>
                  }
                  <p id="status" dangerouslySetInnerHTML={{__html: status}}></p>
                </>
              }
            </div>
          )}
          {<Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={isMinting}
          >
            <CircularProgress color="inherit" />
        </Backdrop>}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Minter;
