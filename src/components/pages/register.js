import React, { useEffect, useState } from 'react';
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import { navigate } from '@reach/router';
import isEmpty from "../../validation/isEmpty";
import api from '../../core/api';
import { Axios } from '../../core/axios';
import {NotificationManager} from 'react-notifications';
import { connectWallet, getCurrentWallet } from '../../core/nft/interact';
import $ from 'jquery';

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
  .wallet-input {
    position: relative;
  }
  .btn-wallet {
    position: absolute;
    padding: 5px 10px;
    top: 4px;
    right: 4px;
    border: none;
    border-radius: 50%;
    transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  }
  .btn-wallet:hover {
    padding: 5px 10px;
    border-radius: 50%;
    background: #ddd;
  }
`;

const WalletInput = (props) => {
  return (
    <div className="wallet-input">
      <input type='text' name='wallet' id='wallet' className="form-control" onChange={(ev) => props.handleChange(ev)} defaultValue={props.walletAddress ? props.walletAddress : ''} disabled/>
      {!props.walletAddress && (
        <button className="btn-wallet" onClick={(ev) => props.handleWallet()}>🦊</button>
      )}
    </div>
  )
}

const Register = () => {
  const [user, setUser] = useState({});
  const [walletAddress, setWallet] = useState("");

  const handleChangeEdit = (ev) => {
    setUser({ ...user, [ev.target.name]: ev.target.value });
  }

  const handleChangeWallet = (ev) => {
    setWallet(ev.target.value);
  }

  useEffect(() => {
    async function getExistingWallet() {
      const { account } = await getCurrentWallet();
      setWallet(account);
      addWalletListener();
    }
    getExistingWallet();
  }, []);
  
  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
        } else {
          setWallet("");
        }
      });
    } else {
      setWallet("");
    }
  };

  const handleWallet = async () => {
    const walletResponse = await connectWallet();
    if(walletResponse.address) 
      setWallet(walletResponse.address);
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (isEmpty(user.name)) { 
      $('#name').focus();
      NotificationManager.warning("Please input your name.", "Warning"); 
      return; 
    }
    if (isEmpty(user.email)) { 
      $('#email').focus();
      NotificationManager.warning("Please input your Email address.", "Warning"); 
      return; 
    }
    if (/\S+@\S+\.\S+/.test(user.email) === false) {
      $('#email').focus();
      NotificationManager.warning("Please input a valid Email address", "Warning"); 
      return; 
    }
    if (isEmpty(user.username)) { 
      $('#username').focus();
      NotificationManager.warning("Please input your user name.", "Warning"); 
      return; 
    }    
    if (isEmpty(walletAddress)) { 
      $('#wallet').focus();
      NotificationManager.warning("Please input wallet address'.", "Warning"); 
      return; 
    }
    if (isEmpty(user.password)) { 
      $('#password').focus();
      NotificationManager.warning("Please input your password.", "Warning"); 
      return; 
    }
    if (isEmpty(user.confirm_password)) { 
      $('#confirm_password').focus();
      NotificationManager.warning("Please input 'Re-enter Password'.", "Warning"); 
      return; 
    }
    if (user.password !== user.confirm_password) { 
      $('#confirm_password').focus();
      NotificationManager.warning("Please input passwords correctly.", "Warning"); 
      return; 
    }
      
    await Axios.post(`${api.baseUrl}${api.users}`,
      {
        "name":user.name, 
        "username":user.username, 
        "email":user.email, 
        "password":user.password,
        "wallet": walletAddress
      }, {}
    ).then(response => {
        NotificationManager.success("Successfully signed up.", "Success");
        navigate('/login');
        return;
    }).catch(error => {
      if (error && error.response && error.response.data && error.response.data.message)
        NotificationManager.error(error.response.data.message, 'Error');
      else
        NotificationManager.error('Internal Server Error', 'Error');
    })

  }

  return (
    <div>
      <GlobalStyles />

      <section className='jumbotron breadcumb no-bg' style={{ backgroundImage: `url(${'./img/background/subheader.jpg'})` }}>
        <div className='mainbreadcumb'>
          <div className='container'>
            <div className='row'>
              <div className="col-md-12 text-center">
                <h1>Sign Up</h1>
                <p>Anim pariatur cliche reprehenderit</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='container'>
        <div className="row">

          <div className="col-md-8 offset-md-2">
            <h3>Don't have an account? Register now.</h3>
            <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>

            <div className="spacer-10"></div>
            <div name="contactForm" id='contact_form' className="form-border" action='#'>

              <div className="row">

                <div className="col-md-6">
                  <div className="field-set">
                    <label>Name:</label>
                    <input type='text' name='name' id='name' className="form-control" onChange={(ev) => handleChangeEdit(ev)} />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="field-set">
                    <label>Email Address:</label>
                    <input type='email' name='email' id='email' className="form-control" onChange={(ev) => handleChangeEdit(ev)} />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="field-set">
                    <label>Choose a Username:</label>
                    <input type='text' name='username' id='username' className="form-control" onChange={(ev) => handleChangeEdit(ev)} />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="field-set">
                    <label>Wallet:</label>
                    <WalletInput handleChange={handleChangeWallet} walletAddress={walletAddress} handleWallet={handleWallet}/>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="field-set">
                    <label>Password:</label>
                    <input type='password' name='password' id='password' className="form-control" onChange={(ev) => handleChangeEdit(ev)} />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="field-set">
                    <label>Re-enter Password:</label>
                    <input type='password' name='confirm_password' id='confirm_password' className="form-control" 
                      onChange={(ev) => handleChangeEdit(ev)} 
                      onKeyUp={(ev) => { if (ev.keyCode === 13) handleSubmit(ev); }}
                    />
                  </div>
                </div>
                

                <div className="col-md-12">
                  <div id='button' className="pull-left">
                    <input type='button' id='send_message' value='Sign Up' 
                      onClick={(ev) => handleSubmit(ev)}                    
                     className="btn btn-main color-2" />
                  </div>

                  <div className="clearfix"></div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>

  );
}

export default Register;