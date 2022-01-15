import React from 'react';
import { Link } from '@reach/router';
import { createGlobalStyle } from 'styled-components';
import { FaTwitter } from 'react-icons/fa';
import { FaTelegramPlane } from 'react-icons/fa';
import { FaDiscord } from 'react-icons/fa';

const GlobalStyles = createGlobalStyle`
    .social-icons span {
        text-shadow: none;
        color: #fff !important;
        background: #403f83;
        padding: 10px 10px 8px;
        width: 34px;
        height: 34px;
        text-align: center;
        font-size: 16px;
        border-radius: 5px;
        margin: 0 5px;
    }
`;

const footer= () => (
  <footer className="footer-light">
            <div className="container">
                <GlobalStyles />
                <div className="row">
                    <div className="col-md-3 col-sm-6 col-xs-1">
                        <div className="widget">
                            <h5>Marketplace</h5>
                            <ul>
                                <li><Link to="">All NFTs</Link></li>
                                <li><Link to="">Art</Link></li>
                                <li><Link to="">Music</Link></li>
                                <li><Link to="">Domain Names</Link></li>
                                <li><Link to="">Virtual World</Link></li>
                                <li><Link to="">Collectibles</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6 col-xs-1"></div>
                    <div className="col-md-3 col-sm-6 col-xs-1"></div>
                    <div className="col-md-3 col-sm-6 col-xs-1">
                        <div className="widget">
                            <h5>Newsletter</h5>
                            <p>Signup for our newsletter to get the latest news in your inbox.</p>
                            <form action="#" className="row form-dark" id="form_subscribe" method="post" name="form_subscribe">
                                <div className="col text-center">
                                    <input className="form-control" id="txt_subscribe" name="txt_subscribe" placeholder="enter your email" type="text" /> 
                                    <Link to="" id="btn-subscribe">
                                      <i className="arrow_right bg-color-secondary"></i>
                                    </Link>
                                    <div className="clearfix"></div>
                                </div>
                            </form>
                            <div className="spacer-10"></div>
                            <small>Your email is safe with us. We don't spam.</small>
                        </div>
                    </div>
                </div>
            </div>
            <div className="subfooter">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="de-flex">
                                <div className="de-flex-col">
                                    <span onClick={()=> window.open("", "_self")}>
                                        <img alt="" className="f-logo d-1" src="./img/Spectra_logo.png" />
                                        <img alt="" className="f-logo d-3" src="./img/Spectra_logo_light.png" />
                                        <img alt="" className="f-logo d-4" src="./img/Spectra_logo_mark_only.png" />
                                        <span className="copy">&copy; Copyright Spectra 2021</span>
                                    </span>
                                </div>
                                <div className="de-flex-col">
                                    <div className="social-icons">
                                        <span onClick={()=> window.open("https://twitter.com/", "_blank")}><FaTwitter /></span>
                                        <span onClick={()=> window.open("https://web.telegram.org/", "_blank")}><FaTelegramPlane /></span>
                                        <span onClick={()=> window.open("https://discord.gg/2xf9x7fwYk", "_blank")}><FaDiscord /></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
);
export default footer;