import React, { useEffect, useState } from 'react';
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import { useDispatch } from 'react-redux';
import jwt_decode from "jwt-decode";
import Axios from 'axios';
import { cleanCurrentUser, setCurrentUserAction } from "../../store/actions/thunks";
import api from "../../core/api";
import { clearNfts, clearFilter } from '../../store/actions';
import getList from '../../services/nftService';
import { totalCountOfNFTs } from "../../store/actions/thunks";
import * as selectors from '../../store/selectors';
import NftCard from '../components/NftCard';
import { fillNftsBreakdown } from '../../store/actions/thunks';
import { useSelector } from "react-redux";
import Select from 'react-select';
import { categories, status, itemsType } from '../components/constants/filters';
import { useRef } from 'react';

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

const Explore = () => {

  var dispatch = useDispatch();

  const [nftList, setnftList] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);
  const [height, setHeight] = useState(0);
  const [filterOptions, setFilterOptions] = useState("");
  const totalCount = useSelector(selectors.nftTotalCount);
  const nftSituation = "minted";
  const authorId = null;
  const [nftStatus, setNftStatus] = useState(null);
  const [nftCategory, setNftCategory] = useState("");
  const [nftItemType, setNftItemType] = useState("");
  const [nftTitle, setNftTitle] = useState("");
  const isScreenMounted = useRef(true);

  useEffect(() => {
      return () =>  isScreenMounted.current = false
  },[])

  useEffect(() => {
    if(!isScreenMounted.current) return;
    dispatch(totalCountOfNFTs(nftSituation, nftCategory, nftItemType, nftStatus, nftTitle));
    let addOptions = "";
    if (authorId !== "" && authorId !== undefined && authorId !== null) {
      if (addOptions === "") addOptions = `author=${authorId}`;
      else addOptions += `&author=${authorId}`;
    }
    if (nftSituation !== "" && nftSituation !== undefined && nftSituation !== null) {
      if (addOptions === "") addOptions = `situation=${nftSituation}`;
      else addOptions += `&situation=${nftSituation}`;
    }
    if (nftStatus !== "" && nftStatus !== undefined && nftStatus !== null) {
      if (addOptions === "") addOptions = `status=${nftStatus}`;
      else addOptions += `&status=${nftStatus}`;
    }
    if (nftCategory !== "" && nftCategory !== undefined && nftCategory !== null) {
      if (addOptions === "") addOptions = `category=${nftCategory}`;
      else addOptions += `&category=${nftCategory}`;
    }
    if (nftItemType !== "" && nftItemType !== undefined && nftItemType !== null) {
      if (addOptions === "") addOptions = `item_type=${nftItemType}`;
      else addOptions += `&item_type=${nftItemType}`;
    }
    if (nftTitle !== "" && nftTitle !== undefined && nftTitle !== null) {
      if (addOptions === "") addOptions = `title=${nftTitle}`;
      else addOptions += `&title=${nftTitle}`;
    }
    setFilterOptions(addOptions);
    setnftList([]);
    setNoData(true);
    setPage(0);
    loadnftList(totalCount, filterOptions);
  }, [dispatch, totalCount, filterOptions, nftSituation, nftCategory, nftItemType, nftStatus, nftTitle]);

  const handleCategory = (option) => {
    const {value} = option;
    setNftCategory(value);
  }

  const handleStatus = (option) => {
    const {value} = option;
    setNftStatus(value);
  }

  const handleItemsType = (option) => {
    const {value} = option;
    setNftItemType(value);
  }

  const filterNftTitles = (event) => {
    setNftTitle(event.target.value);
  }

  const defaultValue = {
    value: null,
    label: 'Select Filter'
  };

  const customStyles = {
    option: (base, state) => ({
      ...base,
      background: "#fff",
      color: "#333",
      borderRadius: state.isFocused ? "0" : 0,
      "&:hover": {
        background: "#eee",
      }
    }),
    menu: base => ({
      ...base,
      borderRadius: 0,
      marginTop: 0
    }),
    menuList: base => ({
      ...base,
      padding: 0
    }),
    control: (base, state) => ({
      ...base,
      padding: 2
    })
  };

  window.onscroll = () => {
    if(!isScreenMounted.current) return; 
    if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
      if (!noData) {
        loadnftList(totalCount, filterOptions);
      }
    }
  }

  const loadnftList = (totalCount, filterOptions) => {

    if(!isScreenMounted.current) return;
    if (totalCount <= 0) return;

    setLoading(true);
    setTimeout(() => {
      getList(page, totalCount, filterOptions)
        .then((data) => {
          if (data === 0) setNoData(true);
          else {
            setNoData(false);
            const newPage = page + 1;

            const newList = nftList.concat(data);
            setnftList(newList);
            setPage(newPage);
            dispatch(fillNftsBreakdown(newList));
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setLoading(false);
        })
    }, 500);
  }

  const onImgLoad = ({ target: img }) => {
    if(!isScreenMounted.current) return;
    let currentHeight = height;
    if (currentHeight < img.offsetHeight) {
      setHeight(img.offsetHeight);
    }
  }

  //will run when component unmounted
  useEffect(() => {
    if(!isScreenMounted.current) return;
    return () => {
      dispatch(clearFilter());
      dispatch(clearNfts());
    }
  }, [dispatch]);

  useEffect(() => {
    if(!isScreenMounted.current) return;
      if (localStorage.getItem("jwtToken")) {
        const decoded = jwt_decode(localStorage.getItem("jwtToken"));
        const currTime = Date.now() / 1000;
        if (decoded.app < currTime) {
          dispatch(cleanCurrentUser());
          localStorage.removeItem("jwtToken");
        }
        else {
          let filter = decoded.id ? '/' + decoded.id : '';
          Axios.get(`${api.baseUrl}${api.users}${filter}`, {}, {
          })
            .then(function (response) {
              dispatch(setCurrentUserAction(response.data));
            })
            .catch(function (error) {
              // handle error
              console.log(error);
            })
            .then(function () {
              // always executed
            });
        }
      }
  }, [dispatch]);


  return (
    <div>
      <GlobalStyles />

      <section className='jumbotron breadcumb no-bg' style={{ backgroundImage: `url(${'./img/background/subheader.jpg'})` }}>
        <div className='mainbreadcumb'>
          <div className='container'>
            <div className='row m-10-hor'>
              <div className='col-12'>
                <h1 className='text-center'>Explore</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='container'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className="items_filter">
            <form className="row form-dark" id="form_quick_search" name="form_quick_search">
                <div className="col">
                    <input
                        className="form-control"
                        id="name_1"
                        name="name_1"
                        placeholder="search item here..."
                        type="text"
                        onChange={(event) => filterNftTitles(event)}
                    />
                    <button id="btn-submit">
                        <i className="fa fa-search bg-color-secondary"></i>
                    </button>
                    <div className="clearfix"></div>
                </div>
            </form>
              <div className='dropdownSelect one'>
                <Select
                  styles={customStyles}
                  menuContainerStyle={{ 'zIndex': 999 }}
                  options={[defaultValue, ...categories]}
                  onChange={(option) => handleCategory(option)}
                />
              </div>
              <div className='dropdownSelect two'>
                <Select
                  styles={customStyles}
                  options={[defaultValue, ...status]}
                  onChange={(option) => handleStatus(option)}
                />
              </div>
              <div className='dropdownSelect three'>
                <Select
                  styles={customStyles}
                  options={[defaultValue, ...itemsType]}
                  onChange={(option) => handleItemsType(option)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="row">

          {nftList && nftList.map((nft, index) => (
            <NftCard nft={nft} key={index} onImgLoad={(img) => onImgLoad(img)} height={height} />
          ))
          }
          {loading ? <div className="text-center">Loading data ...</div> : ""}
          {noData ? <div className="text-center">No data anymore ...</div> : ""}
        </div>
      </section>


      <Footer  />
    </div>

  );
}
export default Explore;