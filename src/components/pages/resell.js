import React, { useEffect, useState } from "react";
import Select from 'react-select';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import swal from 'sweetalert';
import { NotificationManager } from 'react-notifications';
import Clock from "../components/Clock";
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import { navigate } from "@reach/router";
import { categories } from '../components/constants/filters';
import api from "../../core/api";
import { useDispatch, useSelector } from "react-redux";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import * as selectors from '../../store/selectors';
import { fetchNftDetail } from "../../store/actions/thunks";
import { reselllingNFTAction } from "../../store/actions/thunks";
import TextField from '@mui/material/TextField';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DateTimePicker from '@mui/lab/DateTimePicker';

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
  .form-control:disabled {
    background-color: #fff;
  }
`;

const customStyles = {
  option: (base) => ({
    ...base,
    background: "#fff",
    color: "#333",
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

const Resell = ({nftId}) => {

  const dispatch = useDispatch();
  const currentUser = useSelector(selectors.currentUser);
  const isAuthorized = useSelector(selectors.isAuthorized);
  const consideringNFT = useSelector(selectors.nftDetailState).data;
  const [loading, setLoading] = useState(false);
  const [deadline, setDeadLine] = useState(new Date());
  const [auctionInterval, setauctionInterval] = useState(0);

  const hadleChangeDeadline = (value) => {
    let dl = Date.parse(value) - Date.now();
    if(dl > 1000 * 60)    // bigger than 60s 
    {
      setDeadLine(value);
      setauctionInterval(dl);
    }
    else {
      NotificationManager.warning("Deadline incorrects. Please re-input.", "Warning");      
      setDeadLine( (new Date()) );
    }
  }

  const handleActive1 = () => {
    document.getElementById("tab_opt_1").classList.add("show");
    document.getElementById("tab_opt_1").classList.remove("hide");
    document.getElementById("tab_opt_2").classList.remove("show");
    document.getElementById("tab_opt_3").classList.add("hide");
    document.getElementById("tab_opt_3").classList.remove("show");
    document.getElementById("btn1").classList.add("active");
    document.getElementById("btn2").classList.remove("active");
    document.getElementById("btn3").classList.remove("active");
  }

  const handleActive2 = () => {
    document.getElementById("tab_opt_1").classList.add("hide");
    document.getElementById("tab_opt_1").classList.remove("show");
    document.getElementById("tab_opt_2").classList.add("show");
    document.getElementById("tab_opt_3").classList.add("hide");
    document.getElementById("tab_opt_3").classList.remove("show");
    document.getElementById("btn1").classList.remove("active");
    document.getElementById("btn2").classList.add("active");
    document.getElementById("btn3").classList.remove("active");
  }

  const handleActive3 = () => {
    document.getElementById("tab_opt_1").classList.add("hide");
    document.getElementById("tab_opt_2").classList.add("hide");
    document.getElementById("tab_opt_1").classList.remove("show");
    document.getElementById("tab_opt_2").classList.remove("show");
    document.getElementById("tab_opt_3").classList.add("show");
    document.getElementById("tab_opt_3").classList.remove("hide");
    document.getElementById("btn1").classList.remove("active");
    document.getElementById("btn2").classList.remove("active");
    document.getElementById("btn3").classList.add("active");
  }
  
  const checkAuctionStatus = (value) => {
    console.log(value);
  }

  useEffect(() => {
    dispatch(fetchNftDetail(nftId));
  }, [nftId, dispatch]);

  const [method, setMethod] = useState('');  
  const [token_type, setTokenType] = useState('BNB');
  // const loading =  false;
  var fields = {};
  var errors ={};
  if(consideringNFT) {
    fields = consideringNFT;
    if (consideringNFT.status !== method && method === '')
      setMethod(consideringNFT.status);
  }

  useEffect(() => {
    if (method === 'buy_now') {
      handleActive1();
    } else if (method === 'on_auction') {
      handleActive2();
    } else if (method === 'has_offers') {
      handleActive3();
    }
  }, [method])

  useEffect(() => {
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


  const handleShow = () => {
    setMethod('buy_now');
  }
  const handleShow1 = () => {
    setMethod('on_auction');
  }
  const handleShow2 = () => {
    setMethod('has_offers');
  }

  const handleTokenType = (e) => {
    setTokenType(e.target.value);
  }

  const handleValidation = () => {

    var formIsValid = true;

    if (!fields.category) {
      formIsValid = false;
      errors = {...errors, category : "This field is required."};
    }

    if (method === 'buy_now' && (!fields["price"] || fields["price"] <= 0)) {
      formIsValid = false;
      errors = {...errors, price : "This field is required."};
    }

    if (method === 'on_auction' && (!fields["priceover"] || fields["priceover"] <= 0)) {
      formIsValid = false;
      errors = {...errors, priceover : "This field is required."};
    }

    if (method === 'on_auction' && auctionInterval<0) {
      formIsValid = false;
      errors = {...errors, deadline : "This field is required."};
    }

    if (method === 'has_offers' && (!fields["max_bid"] || fields["max_bid"] <= 0)) {
      formIsValid = false;
      errors = {...errors, max_bid: "This field is required."};
    }

    if (!fields["title"]) {
      formIsValid = false;
      errors = {...errors, title : "This field is required."};
    }

    if (!fields.description) {
      formIsValid = false;
      errors = {...errors, description : "This field is required."};
    }
    return formIsValid;
  }

  const handleChange = (e) => {
    fields = {...fields, [e.target.name] : e.target.value};
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthorized) {
      NotificationManager.warning("Please sign in.", "Warning", 3000,
        function () {
          navigate('/home');
        });
      return;
    }
    if (!currentUser || (currentUser && currentUser.role.name === 'Public')) {
      NotificationManager.warning("Please contact a manager. You have no permission to create NFT.", "Warning");
      return;
    }

    if (handleValidation()) {
      setLoading(true);
      const param = {
        category: fields.category,
        status: method,
        end_date: auctionInterval,
        title: fields.title,
        price: fields.price,
        description: fields.description,
        priceover: fields.priceover,
        author: currentUser.author ? currentUser.author.id : 1,
        author_info: currentUser.author,
        token_type: token_type,
        royalties : fields.royalties,
        max_bid: fields.max_bid,
        situation: "minted"
      };
      if(param.status !== "on_auction") param.deadline = null;
      const res = await reselllingNFTAction(param, consideringNFT.id, consideringNFT.token_uri);
      if (res.success) {
        NotificationManager.success("Reselling operation succeed.", "Success");
        setLoading(false);
        navigate("/explore");
      } else {
        NotificationManager.error(res.status, "Error");
        setLoading(false);
        return;
      }
    }
  }

  let message = '';
  if (!currentUser || (currentUser.role && currentUser.role.name === 'Public')) {
    message = `You can't create NFT.<br/>You have no permission to create NFT. Please contact an manager.`;
  }
  if (currentUser && currentUser.author && consideringNFT && (consideringNFT.author === null || currentUser.author.id !== consideringNFT.author.id)) {
    console.log('[CurrentUser] = ', currentUser.author.id);
    console.log('[consideringNFT] = ', consideringNFT.author.id);
    navigate('/explore');
  }

  return (
    <div>
      <GlobalStyles />

      <section className='jumbotron breadcumb no-bg' style={{ backgroundImage: `url(${'/img/background/subheader.jpg'})` }}>
        <div className='mainbreadcumb'>
          <div className='container'>
            <div className='row m-10-hor'>
              <div className='col-12'>
                <h1 className='text-center'>Resell</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='container'>

        <div className="row">
          <div className="col-lg-7 offset-lg-1 mb-5">
            <form id="form-create-item" className="form-border" >
              {message && (
                <div className="alert alert-danger" role="alert" dangerouslySetInnerHTML={{ __html: message }}></div>
              )}
              <div className="field-set">

                <h5>Select method</h5>
                <div className="de_tab tab_methods">
                  <ul className="de_nav">
                    <li id='btn1' className="active" onClick={() => handleShow()}><span><i className="fa fa-tag"></i>Fixed price</span>
                    </li>
                    <li id='btn2' onClick={() => handleShow1()}><span><i className="fa fa-hourglass-1"></i>Timed auction</span>
                    </li>
                    <li id='btn3' onClick={() => handleShow2()}><span><i className="fa fa-users"></i>Open for bids</span>
                    </li>
                  </ul>

                  <div className="de_tab_content pt-3">
                    <div id="tab_opt_1">
                      <h5>Price</h5>
                      <div className="row">
                        <div className="col-md-8">
                          {
                            consideringNFT && consideringNFT.price && consideringNFT.price>=0 ? 
                            <input type="number" name="price" id="price" 
                            onChange={(e) => handleChange(e)}                             
                            defaultValue={parseFloat(consideringNFT.price)}
                            className="form-control mb-2" placeholder="enter price for one item" step="0.001" />
                            :
                            <input type="number" name="price" id="price" 
                            onChange={(e) => handleChange(e)}       
                            className="form-control mb-2" placeholder="enter price for one item" step="0.001" />
                          }
                          <span style={{ color: "red" }}>{errors["price"]}</span>
                        </div>
                        <div className="col-md-4">
                        <RadioGroup row aria-label="token_type" 
                            defaultValue={consideringNFT && consideringNFT.token_type ? consideringNFT.token_type: "BNB"} 
                            name="row-radio-buttons-group" style={{ float: 'right' }} onChange={() => handleTokenType()}
                          >
                            <FormControlLabel value="BNB" control={<Radio />} label="BNB" />
                            <FormControlLabel value="SPC" control={<Radio />} label="SPC" />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>

                    <div id="tab_opt_2" className='hide'>
                      <h5>Start Price</h5>
                      <div className="row">
                        <div className="col-md-8">                          
                        {
                          consideringNFT && consideringNFT.priceover && consideringNFT.priceover>=0 ? 
                          <input type="number" name="priceover" id="priceover" 
                            onChange={(e) => handleChange(e)} 
                            defaultValue={parseFloat(consideringNFT.priceover)}
                            className="form-control mb-2" placeholder="enter start price" />
                          :
                          <input type="number" name="priceover" id="priceover" 
                            onChange={(e) => handleChange(e)} 
                            className="form-control mb-2" placeholder="enter start price" />
                        }
                        <span style={{ color: "red" }}>{errors["priceover"]}</span>
                        </div>
                        <div className="col-md-4">
                          <RadioGroup row aria-label="token_type" 
                            defaultValue={consideringNFT && consideringNFT.token_type ? consideringNFT.token_type: "BNB"} 
                            name="row-radio-buttons-group" style={{ float: 'right' }} onChange={() => handleTokenType()}
                          >
                            <FormControlLabel value="BNB" control={<Radio />} label="BNB" />
                            <FormControlLabel value="SPC" control={<Radio />} label="SPC" />
                          </RadioGroup>
                        </div>
                      </div>
                      <div className="row pt-1">
                        <div className="col-md-12">
                          <h5>Expiration date</h5>                          
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                              <DateTimePicker
                                renderInput={(props) => <TextField variant="standard" className="form-control mb-2" {...props} />}                                 
                                label = ""                            
                                value={deadline}
                                onChange={(newValue) => {
                                  hadleChangeDeadline(newValue);
                                }}
                                minDateTime={new Date()}
                                inputFormat="dd/MM/yyyy hh:mm a"
                              />
                            </LocalizationProvider>
                          <span style={{ color: "red" }}>{errors["deadline"]}</span>
                        </div>
                      </div>
                    </div>

                    <div id="tab_opt_3" className='hide'>
                        <div className="row">
                          <h5 className="col-md-6">Start price</h5>
                          <h5 className="col-md-6">Maximum bid</h5>
                        </div>    
                        <div className="row"> 
                          <div className="col-md-6">
                            {
                              consideringNFT && consideringNFT.priceover ?
                              <input type="number" name="priceover" id="resell_priceover" 
                                onChange={(e) => handleChange(e)} 
                                defaultValue={parseFloat(consideringNFT.priceover)}
                                className="form-control mb-2" placeholder="enter start price" />
                              :
                              <input type="number" name="priceover" id="resell_priceover" 
                                onChange={(e) => handleChange(e)} 
                                className="form-control mb-2" placeholder="enter start price" />
                            }
                            <span style={{ color: "red" }}>{errors["priceover"]}</span>
                          </div>
                          <div className="col-md-6">
                            {
                              consideringNFT && consideringNFT.max_bid && consideringNFT.max_bid > 0 ?
                              <input type="number" name="max_bid" id="max_bid" onChange={(e) => handleChange(e)}  
                                defaultValue={consideringNFT.max_bid}
                                className="form-control mb-2" placeholder="enter maximum bid" step="1" />
                              :
                              <input type="number" name="max_bid" id="max_bid" onChange={(e) => handleChange(e)}  className="form-control mb-2" placeholder="enter maximum bid" step="1" />
                            }
                            <span style={{ color: "red" }}>{errors["max_bid"]}</span>                          
                        </div>
                      </div>
                    </div>

                    <div className='de_tab_content dropdownSelect one pt-1'>
                      <h5>Category</h5>
                        <Select 
                            styles={customStyles} 
                            menuContainerStyle={{'zIndex': 999}}
                            options={categories}
                            defaultValue={ categories.filter(option => option.value === consideringNFT && consideringNFT.category ? consideringNFT.category : 'art')}
                            className="mb-2"
                            isDisabled={true}
                        />
                      <span style={{ color: "red" }}>{errors["category"]}</span>
                    </div>

                  </div>

                </div>

                <h5>Title</h5>
                <input type="text" name="title" id="item_title" 
                  defaultValue={consideringNFT && consideringNFT.title ? consideringNFT.title  : "" }
                  className="form-control mb-2" placeholder="e.g. 'Crypto Funk" disabled/>
                <span style={{ color: "red" }}>{errors["item_title"]}</span>

                <h5>Description</h5>
                <textarea data-autoresize name="description" id="description" 
                  defaultValue={consideringNFT && consideringNFT.description ? consideringNFT.description  : "" }
                  className="form-control mb-2" placeholder="e.g. 'This is very limited item'" disabled></textarea>
                <span style={{ color: "red" }}>{errors["description"]}</span>

                <div className="spacer-10"></div>

                <button id="submit" onClick={(e) => handleSubmit(e)} className="btn-main">Resell Item</button>
              </div>
            </form>
          </div>

          <div className="col-lg-3 col-sm-6 col-xs-12">
            <h5>Preview item</h5>
            <div className="nft__item m-0">
              {method === "on_auction" && deadline && (
                <div className="de_countdown">
                  <Clock deadline={auctionInterval} nftId={consideringNFT.id} checkAuctionStatus={checkAuctionStatus} />
                </div>
              )}
              <div className="author_list_pp">
                <span>
                  <img className="lazy" src={(currentUser && currentUser.author && currentUser.author.avatar ? api.baseUrl + currentUser.author.avatar.url : `${window.location.origin}/img/avatar.jpg`)} alt="" />
                  <i className="fa fa-check"></i>
                </span>
              </div>
              <div className="nft__item_wrap">
                <span>
                  <img src={(consideringNFT && consideringNFT.unique_id ? consideringNFT.unique_id: '')} id="get_file_2" className="lazy nft__item_preview" alt="" />
                </span>
              </div>
              <div className="nft__item_info">
                <span >
                  <h4>{fields.title}</h4>
                </span>
                {method === 'buy_now' && fields.price && (
                  <div className="nft__price">
                    {fields.price} {token_type}
                  </div>
                )}
                {method !== 'buy_now' && fields.priceover && (
                  <div className="nft__price">
                    {fields.priceover} {token_type}
                  </div>
                )}
              </div>
            </div>
          </div>
          {<Backdrop
              sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
              open={loading}
          >
              <CircularProgress color="inherit" />
          </Backdrop>}
        </div>

      </section>

      <Footer />
    </div>
  );

}

export default Resell;
