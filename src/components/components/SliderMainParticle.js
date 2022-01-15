import React from "react";
import Reveal from 'react-awesome-reveal';
import { keyframes } from "@emotion/react";
import { useSelector } from "react-redux"; 
import * as selectors from '../../store/selectors';
import {Link} from "@reach/router";

const fadeInUp = keyframes`
  0% {
    opacity: 0;
    -webkit-transform: translateY(40px);
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
`;

const NavLink = props => (
  <Link 
    {...props}
    getProps={({ isCurrent }) => {
      // the object returned here is passed to the
      // anchor element's props
      return {
        className: isCurrent ? 'active' : 'non-active',
      };
    }}
  />
);

const Slidermainparticle = () => {
  

  const isAuthorized = useSelector(selectors.isAuthorized);

  return(
 <div className="container">
    <div className="row align-items-center">
          <div className="col-md-6">
              <div className="spacer-single"></div>
              <div className="spacer-double"></div>
              <Reveal className='onStep' keyframes={fadeInUp} delay={300} duration={900} triggerOnce>
              <h1 className="col-white">Create, sell or collect digital items.</h1>
              </Reveal>
              <Reveal className='onStep' keyframes={fadeInUp} delay={600} duration={900} triggerOnce>
              <p className="lead col-white">
              Unit of data stored on a digital ledger, called a blockchain, that certifies a digital asset to be unique and therefore not interchangeable
              </p>
              </Reveal>
              <div className="spacer-10"></div>
              <Reveal className='onStep' keyframes={fadeInUp} delay={800} duration={900} triggerOnce>
              { (isAuthorized === true) ? 
                <span className="btn-main lead"><NavLink to="/explore" >Explore</NavLink></span> 
                :
                <div className="row">
                  <span className="btn-main lead col-md-2"><NavLink to="/login" >Sign In</NavLink></span>                   
                  &nbsp;&nbsp;&nbsp;
                  <span className="btn-main lead col-md-2"><NavLink to="/register" >Sign Up</NavLink></span>
                </div>
              }
              <div className="mb-sm-30"></div>
              </Reveal>
          </div>
      </div>
    </div>
);
}
export default Slidermainparticle;