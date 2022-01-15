import React, { Component } from "react";
import { connect } from 'react-redux';
import Select from 'react-select';
import Backdrop from '@mui/material/Backdrop';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import swal from 'sweetalert';
import { NotificationManager } from 'react-notifications';
import Clock from "../components/Clock";
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import { createMultipleNft } from "../../store/actions/thunks";
import { navigate } from "@reach/router";
import { categories } from '../components/constants/filters';
import api from "../../core/api";
import {
  connectWallet,
  getCurrentWalletConnected,
} from "../../core/nft/interact";

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

class Createpage extends Component {

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.state = {
      selected_file: null,
      selected_file_url: '',
      files: [],
      method: 'buy_now',
      loading: false,
      token_type: 'BNB',
      wallet: '',
      status: '',
      fields: {},
      errors: {},
    };
  }

  componentDidMount() {
    if (!localStorage.getItem("jwtToken")) {
      swal({
        title: "Warning",
        text: "You can't mint. Please sign in!",
        icon: "warning",
      }).then(() => {
        navigate('/login');
      });
      return;
    }
    this.getExistingWallet();
  }
  onChange(e) {
    var files = e.target.files;
    var filesArr = Array.prototype.slice.call(files);
    document.getElementById("file_name").style.display = "none";
    if (files[0]) {
      this.setState({ selected_file: files[0] });
      document.getElementById("get_file_2").src = URL.createObjectURL(files[0]);
    }
    this.setState({ files: filesArr });
  }

  handleShow = () => {
    document.getElementById("tab_opt_1").classList.add("show");
    document.getElementById("tab_opt_1").classList.remove("hide");
    document.getElementById("tab_opt_3").classList.add("hide");
    document.getElementById("tab_opt_3").classList.remove("show");
    document.getElementById("btn1").classList.add("active");
    document.getElementById("btn3").classList.remove("active");
    this.setState({ method: 'buy_now' });
  }
  handleShow2 = () => {
    document.getElementById("tab_opt_1").classList.add("hide");
    document.getElementById("tab_opt_1").classList.remove("show");
    document.getElementById("tab_opt_3").classList.add("show");
    document.getElementById("tab_opt_3").classList.remove("hide");
    document.getElementById("btn1").classList.remove("active");
    document.getElementById("btn3").classList.add("active");
    this.setState({ method: 'has_offers' });
  }

  handleTokenType = (e) => {
    this.setState({ token_type: e.target.value });
  }

  handleValidation() {
    let { selected_file, fields, method } = this.state;
    let errors = {};
    let formIsValid = true;

    if (!selected_file) {
      NotificationManager.warning("Please click a image file", "Warning");
      formIsValid = false;
      return formIsValid;
    }

    if (method === 'has_offers' && (!fields["max_bid"] || fields["max_bid"] <= 0)) {
      formIsValid = false;
      errors["max_bid"] = "This field is required.";
    }

    if (!fields["category"]) {
      formIsValid = false;
      errors["category"] = "This field is required.";
    }

    if (method === 'buy_now' && (!fields["price"] || fields["price"] <= 0)) {
      formIsValid = false;
      errors["price"] = "This field is required.";
    }

    if (method === 'has_offers' && (!fields["priceover"] || fields["priceover"] <= 0)) {
      formIsValid = false;
      errors["priceover"] = "This field is required.";
    }

    if (!fields["item_title"]) {
      formIsValid = false;
      errors["item_title"] = "This field is required.";
    }

    if (!fields["item_desc"]) {
      formIsValid = false;
      errors["item_desc"] = "This field is required.";
    }

    if (!fields["item_royalties"] || fields["item_royalties"] < 0) {
      formIsValid = false;
      errors["item_royalties"] = "This field is required.";
    }

    this.setState({ errors: errors });
    return formIsValid;
  }

  handleCategory = (e) => {
    let fields = this.state.fields;
    fields['category'] = e.value;
    this.setState({ fields });
  }

  handleChange = (e) => {
    let fields = this.state.fields;
    fields[e.target.name] = e.target.value;
    this.setState({ fields });
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    const { currentUser, isAuthorized } = this.props;
    if (!localStorage.getItem("jwtToken") || !currentUser || !isAuthorized) {
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

    if (!currentUser || (currentUser && currentUser.role.name === 'Public')) {
      NotificationManager.warning("Please contact an manager. You have no permission to create NFT.", "Warning");
      return;
    }
    const { files, selected_file, fields } = this.state;
    if (this.handleValidation()) {
      this.setState({ 'loading': true });
      const param = {
        category: fields.category,
        status: this.state.method,
        deadline: fields.deadline,
        title: fields.item_title,
        price: fields.price,
        description: fields.item_desc,
        priceover: fields.priceover,
        author_info: currentUser.author,
        author: currentUser.author.id,
        creator: currentUser.author.id,
        token_type: this.state.token_type,
        preview_image: selected_file,
        royalties: fields.item_royalties,
        max_bid: fields.max_bid,
      };
      const result = await createMultipleNft(param, files);
      if (result.success) {
        NotificationManager.success("Successfully create a NFT", "Success");
        const authorId = currentUser && currentUser.author ? currentUser.author.id : 1;
        navigate(`/Author/${authorId}`);
      } else {
        NotificationManager.error(result.status, "Error", 5000);
      }
      this.setState({ status: result.status });
      this.setState({ 'loading': false });
    } else {
      NotificationManager.error('Please insert empty values.', "Error", 5000);
    }
  }

  getExistingWallet = async () => {
    const { address, status } = await getCurrentWalletConnected();

    this.setState({ wallet: address, status: status });

    this.addWalletListener();
  }

  addWalletListener = () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          this.setState({ wallet: accounts[0] });
        } else {
          this.setState({ wallet: "", status: "🦊 Connect to Metamask using the top right button." });
        }
      });
    } else {
      this.setState({
        status: (
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" rel="noreferrer" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        )
      });
    }
  }

  connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    if (walletResponse.status) this.setState({ status: walletResponse.status });
    if (walletResponse.address) this.setState({ wallet: walletResponse.address });
  };


  render() {
    const { loading, wallet, status } = this.state;
    const { currentUser } = this.props;
    let message = '';

    if (!currentUser || (currentUser.role && currentUser.role.name === 'Public')) {
      message = `You can't mint NFT.<br/>You have no permission to mint NFT. Please contact an manager.`;
    } else if (wallet.length > 0) {
      message = `Connected Address: ${wallet}`;
    } else if (wallet.length === 0) {
      message = `Please connect to metamask to start minting`;
    }
    return (
      <div>
        <GlobalStyles />

        <section className='jumbotron breadcumb no-bg' style={{ backgroundImage: `url(${'./img/background/subheader.jpg'})` }}>
          <div className='mainbreadcumb'>
            <div className='container'>
              <div className='row m-10-hor'>
                <div className='col-12'>
                  <h1 className='text-center'>Multiple Create</h1>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='container'>
          <div className="row">
            <div className="col-lg-10 offset-lg-1">
              {message && (
                <div className="alert alert-danger" role="alert" dangerouslySetInnerHTML={{ __html: message }}></div>
              )}
            </div>
            <div className="col-lg-7 offset-lg-1 mb-5">
              <form id="form-create-item" className="form-border" onSubmit={this.handleSubmit}>
                <div className="field-set">
                  <h5>Upload file</h5>

                  <div className="d-create-file">
                    <p id="file_name">PNG, JPG, GIF, WEBP or MP4. Max 200mb.</p>
                    {this.state.files.length > 0 && (
                      <p>You selected {this.state.files.length} files.</p>
                    )}
                    <div className='browse'>
                      <input type="button" id="get_file" className="btn-main" value="Browse" />
                      <input id='upload_file' accept="image/*, video/*" type="file" multiple onChange={this.onChange} />
                    </div>
                  </div>

                  <div className="spacer-single"></div>

                  <h5>Select method</h5>
                  <div className="de_tab tab_methods">
                    <ul className="de_nav">
                      <li id='btn1' className="active" onClick={this.handleShow}><span><i className="fa fa-tag"></i>Fixed price</span>
                      </li>
                      <li id='btn3' onClick={this.handleShow2}><span><i className="fa fa-users"></i>Open for bids</span>
                      </li>
                    </ul>

                    <div className="de_tab_content pt-3">
                      <div id="tab_opt_1">
                        <h5>Price</h5>
                        <div className="row">
                          <div className="col-md-8">
                            <input type="number" name="price" id="price" onChange={this.handleChange} className="form-control mb-2" placeholder="enter price for one item" step="any" />
                            <span style={{ color: "red" }}>{this.state.errors["price"]}</span>
                          </div>
                          <div className="col-md-4">
                            <RadioGroup row aria-label="token_type" defaultValue={'BNB'} name="row-radio-buttons-group" style={{ float: 'right' }} value={this.state.token_type} onChange={this.handleTokenType}>
                              <FormControlLabel value="BNB" control={<Radio />} label="BNB" />
                              <FormControlLabel value="SPC" control={<Radio />} label="SPC" />
                            </RadioGroup>
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
                            <input type="number" name="priceover" id="offering_priceover" onChange={this.handleChange} className="form-control mb-2" placeholder="enter start price" step="0.001" />
                            <span style={{ color: "red" }}>{this.state.errors["priceover"]}</span>
                          </div>
                          <div className="col-md-6">
                            <input type="number" name="max_bid" id="max_bid" onChange={this.handleChange} className="form-control mb-2" placeholder="enter maximum bid" step="1" />
                            <span style={{ color: "red" }}>{this.state.errors["max_bid"]}</span>
                          </div>
                        </div>
                      </div>
                      <div className='de_tab_content dropdownSelect one pt-1'>
                        <h5>Category</h5>
                        <Select
                          styles={customStyles}
                          menuContainerStyle={{ 'zIndex': 999 }}
                          options={[...categories]}
                          onChange={this.handleCategory}
                          className="mb-2"
                        />
                        <span style={{ color: "red" }}>{this.state.errors["category"]}</span>
                      </div>
                    </div>
                  </div>

                  <h5>Title</h5>
                  <input type="text" name="item_title" id="item_title" onChange={this.handleChange} className="form-control mb-2" placeholder="e.g. 'Crypto Funk" />
                  <span style={{ color: "red" }}>{this.state.errors["item_title"]}</span>

                  <div className="spacer-10"></div>

                  <h5>Description</h5>
                  <textarea data-autoresize name="item_desc" id="item_desc" onChange={this.handleChange} className="form-control mb-2" placeholder="e.g. 'This is very limited item'"></textarea>
                  <span style={{ color: "red" }}>{this.state.errors["item_desc"]}</span>

                  <div className="spacer-10"></div>

                  <h5>Royalties</h5>
                  <input type="number" name="item_royalties" id="item_royalties" onChange={this.handleChange} className="form-control mb-2" placeholder="suggested: 0, 10%, 20%, 30%. Maximum is 70%" step="any" />
                  <span style={{ color: "red" }}>{this.state.errors["item_royalties"]}</span>

                  <div className="spacer-10"></div>

                  <button type="submit" id="submit" className="btn-main mb-2">Create Item</button>
                </div>
              </form>
              <p id="status" dangerouslySetInnerHTML={{ __html: status }}></p>
            </div>

            <div className="col-lg-3 col-sm-6 col-xs-12">
              <h5>Preview item</h5>
              <div className="nft__item m-0">
                {this.state.method === "on_auction" && this.state.fields.deadline && (
                  <div className="de_countdown">
                    <Clock deadline={this.state.fields.deadline} />
                  </div>
                )}
                <div className="author_list_pp">
                  <span>
                    <img className="lazy" src={(currentUser && currentUser.author && currentUser.author.avatar && currentUser.author.avatar ? api.baseUrl + currentUser.author.avatar.url : `${window.location.origin}/img/avatar.jpg`)} alt="" />
                    <i className="fa fa-check"></i>
                  </span>
                </div>
                <div className="nft__item_wrap">
                  <span>
                    <img src="./img/items/preview.png" id="get_file_2" className="lazy nft__item_preview" alt="" />
                  </span>
                </div>
                <div className="nft__item_info">
                  <span >
                    <h4>{this.state.fields.item_title}</h4>
                  </span>
                  {this.state.method === 'buy_now' && this.state.fields.price && (
                    <div className="nft__price">
                      {this.state.fields.price} {this.state.token_type}
                    </div>
                  )}
                  {this.state.method === 'has_offers' && this.state.fields.priceover && (
                    <div className="nft__item_price">
                      {this.state.fields.priceover} {this.state.token_type}
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
}

const mapStateToProps = state => ({
  currentUser: state.authors.currentUser,
  isAuthorized: state.authors.isAuthorizedUser,
});

const mapDispatchToProps = (dispatch) => {
  return {}
};

export default connect(mapStateToProps, mapDispatchToProps)(Createpage);