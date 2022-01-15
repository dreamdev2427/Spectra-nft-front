import React from 'react';
import Particle from '../components/Particle';
import SliderMainParticle from '../components/SliderMainParticle';
import FeatureBox from '../components/FeatureBox';
import ColumnNewRedux from '../components/ColumnNewRedux';
import AuthorListRedux from '../components/AuthorListRedux';
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar {
    position: relative;
  }
  header#myHeader.navbar.white {
    background: #fff;
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
  
  header#myHeader .logo .d-block{
    display: none !important;
  }
  header#myHeader .logo .d-none{
    display: block !important;
  }
`;

const Homeone= () => {
  
  return(
  <div>
  <GlobalStyles />
      <section className="jumbotron no-bg" style={{backgroundImage: `url(${window.location.origin}/img/background/2.jpg)`}}>
       <Particle/>
         <SliderMainParticle/>
      </section>

      <section className='container'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='text-center'>
              <h2>Popular Items</h2>
              <div className="small-border"></div>
            </div>
          </div>
        </div>
        
        <ColumnNewRedux limit={8} />
                
      </section>

      <section className='container'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='text-center'>
              <h2>Top Sellers</h2>
              <div className="small-border"></div>
            </div>
          </div>
          <div className='col-lg-12'>
            <AuthorListRedux authorId={""} limit={10}/>
          </div>
        </div>
      </section>

      <section className='container-fluid bg-gray'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='text-center'>
              <h2>Create and sell your NFTs</h2>
              <div className="small-border"></div>
            </div>
          </div>
        </div>
        <div className='container'>
          <FeatureBox/>
        </div>
      </section>

    <Footer />

  </div>
);
  }

export default Homeone;