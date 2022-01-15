import React from "react";
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import { useSelector } from 'react-redux';
import api from '../../core/api';
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
      background: #111;
    }
    .item-dropdown .dropdown a{
      color: #111 !important;
    }
  }
`;

const MyProfile = () => {
  const currentUser = useSelector(selectors.currentUser);

  return (
    <div>
      <GlobalStyles />

    { currentUser && 
      <section id='profile_banner' className='jumbotron breadcumb no-bg' style={{backgroundImage: `url(${currentUser && currentUser.author && currentUser.author.banner ? (api.baseUrl + currentUser.author.banner.url) : `${window.location.origin}/img/banner.jpg` })`}}>
        <div className='mainbreadcumb'>
        </div>
      </section>
    }

    <section className='container d_coll no-top no-bottom'>
      <div className='row'>
        <div className="col-md-12">
          <div className="d_profile">
            <div className="profile_avatar">
                { currentUser && 
                  <div className="d_profile_img">
                    <img src={(currentUser && currentUser.author && currentUser.author.avatar ? api.baseUrl + currentUser.author.avatar.url : `${window.location.origin}/img/avatar.jpg`)}  alt=""/>
                    <i className="fa fa-check"></i>
                  </div>
                }
                <div className="profile_name">
                  <h4>
                      { currentUser && currentUser.author && currentUser.author.name && currentUser.author.name }                                                
                      <div className="clearfix"></div>
                      { currentUser &&  currentUser.author && currentUser.author.wallet &&  
                        <span id="wallet" className="profile_wallet">{ currentUser.author.wallet }</span>
                      }
                      <button id="btn_copy" title="Copy Text">Copy</button>
                  </h4>
                </div>
              </div>
            </div>
        </div>
      </div>
    </section>
          <p></p>
          <p></p>
          <div name="contactForm" id='contact_form' className="form-border" action='#'>

            <div className="row">
              <div className="col-md-2 offset-md-4"><h6>Name:</h6></div>
              <div className="col-md-4">{(currentUser && currentUser.author && currentUser.author.name) && (currentUser.author.name || '')}</div>
            </div>
            <p></p>
            <div className="row">
              <div className="col-md-2 offset-md-4"><h6>Username:</h6></div>
              <div className="col-md-4">{currentUser.username || ''}</div>
            </div>
            <p></p>
            <div className="row">
              <div className="col-md-2 offset-md-4"><h6>Email Address:</h6></div>
              <div className="col-md-6">{currentUser.email || ''}</div>
            </div>
            <p></p>
            <div className="row">
              <div className="col-md-2 offset-md-4"><h6>Wallet:</h6></div>
              <div className="col-md-6">{(currentUser && currentUser.author && currentUser.author.wallet) && (currentUser.author.wallet || '')}</div>
            </div>
            <p></p>
            <div className="row">
              <div className="col-md-2 offset-md-4"><h6>Summary:</h6></div>
            </div>
            <div className="row">
              <div className="col-md-6 offset-md-4">{currentUser.about}</div>
            </div>
            <p></p>

          </div>

      <Footer />
    </div>
  );
}

export default MyProfile;
