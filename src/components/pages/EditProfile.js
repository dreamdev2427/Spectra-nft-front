import React, { useState, memo } from "react";
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import { useSelector } from 'react-redux';
import {NotificationManager} from 'react-notifications';
import * as selectors from '../../store/selectors';
import api from '../../core/api';
import { Axios } from '../../core/axios';
import CropImage from "../components/CropImage";
import isEmpty from "../../validation/isEmpty";
import Code from "../../core/code";
import { useDispatch } from "react-redux";
import { fetchCurrentUser } from "../../store/actions/thunks";
import { navigate } from "@reach/router";
import $ from "jquery";

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

const EditProfile = () => {
  const user = useSelector(selectors.currentUser);
  const dispatch = useDispatch();

  var currentUser = {}; 
  if(user) {
    currentUser = user;
    currentUser.name = user.author ? user.author.name : '';
    currentUser.wallet = user.author ? user.author.wallet : '';
  }
  const [AvatarFileURL, setAvatarFileURL] = useState(0);

  const handleChangeEdit = (event) => {
    event.preventDefault();
    currentUser = { ...currentUser, [event.target.name]: event.target.value };
  }

  const [bannerFile, setBannerFile] = React.useState(null)
  const [avatarChanged, setAvatarChagedFlag] = useState(false);
  const [bannerChanged, setBannerChagedFlag] = useState(false);
    
  const bannerFileHandler = (e) => {
    setBannerFile(e.target.files[0]);
     $("#profile_banner").css("background-image", `url(${URL.createObjectURL(e.target.files[0])})`);
    setBannerChagedFlag(true);
  }

  const handleCropImage = (cropImageURL) => {
    setAvatarFileURL(cropImageURL);
    setAvatarChagedFlag(true);
  }

  const handleSubmit = async (event) => {
    if (isEmpty(currentUser.name)) { 
      NotificationManager.warning('Please insert name', 'warning');
      return;
    }
    if (isEmpty(currentUser.username)) {
      NotificationManager.warning('Please insert user name', 'warning');
      return;
    }
    if (isEmpty(currentUser.email)) { 
      NotificationManager.warning('Please insert email', 'warning');
      return;
    }
    if (!isEmpty(currentUser.new_password)) { 
      if (isEmpty(currentUser.confirm_new_password)) 
      { 
        NotificationManager.warning('Please insert confirm password', 'warning');
        return; 
      }
      if (currentUser.new_password !== currentUser.confirm_new_password) { 
        NotificationManager.warning('Please input passwords correctly', 'warning');
        return; 
      }
    }
        
    // console.log("before take blob ");

      var uploadedAvatarId = "", uploadedBannerId = "";
      // console.log("bannerFile : ", bannerFile);

      const localFile = await fetch(AvatarFileURL);
      await localFile.blob().then(res => 
      {
        var fileBlob = res;
        var madenfilename = `${currentUser.username}_avatar.jpeg`
        var avatarandBannerData = new FormData();
        if(avatarChanged) avatarandBannerData.append('files', fileBlob, madenfilename);  
        if(bannerChanged) avatarandBannerData.append('files', bannerFile, bannerFile.name);  
         
        if(!avatarChanged && !bannerChanged) 
        {          
          currentUser = {...currentUser, role : (currentUser.role ? currentUser.role.id : null) };
          currentUser = {...currentUser, author : (currentUser.author ? currentUser.author.id : null) };               

          Axios.put(`${api.baseUrl}${api.users}/${currentUser.id}`, currentUser, {}).then(response => {
            if (response && response.status === Code.OK) 
            {              
              var dataForUpdateAuthor = {};
              dataForUpdateAuthor = {...dataForUpdateAuthor, "username":currentUser.username};
              dataForUpdateAuthor = {...dataForUpdateAuthor, "name":currentUser.name};
              dataForUpdateAuthor = {...dataForUpdateAuthor, "wallet":currentUser.wallet};
              
              Axios.put(`${api.baseUrl}${api.authors}/${currentUser.author}`, 
                dataForUpdateAuthor, {}).then(response => {
                if (response && response.status === Code.OK) {         
                  dispatch(fetchCurrentUser(currentUser.id));
                  navigate("/explore");
                }
                else {
                  var msg = (response.data && response.data.message && response.data.message) ||
                    (response.message && response.message) || response.toString();
                  if(typeof msg !== "string")  msg = msg[0].messages[0].message;
                  NotificationManager.error(msg, 'Error');
                }
              }).catch(error => {
                var msg = (error.response && error.response.data && error.response.data.message) ||
                  (error.message && error.message) || error.toString();
                  if(typeof msg !== "string")  msg = msg[0].messages[0].message;
                  NotificationManager.error(msg, 'Error');
              })              
            }
            else {
              var msg = (response.data && response.data.message && response.data.message) ||
                (response.message && response.message) || response.toString();
              if(typeof msg !== "string")  msg = msg[0].messages[0].message;
              NotificationManager.error(msg, 'Error');
            }
          }).catch(error => {
            var msg = (error.response && error.response.data && error.response.data.message) ||
              (error.message && error.message) || error.toString();
              if(typeof msg !== "string")  msg = msg[0].messages[0].message;
              NotificationManager.error(msg, 'Error');
          })
        }
        else
        {
          Axios.post(`${api.baseUrl}/upload`, avatarandBannerData , 
          {
            enctype: 'multipart/form-data',
            headers: {
              // "Content-Type" : fileBlob.type,
              "Authorization": "Bearer "+localStorage.getItem("jwtToken") , // <- Don't forget Authorization header if you are using it.
            },
          }
          ).then(response => 
            {
            // console.log("response after sending files : ", response);

            if (response && (response.status === Code.OK || response.status === Code.CREATED )) {          
              // NotificationManager.success("Uploading files succeed.", 'Success');

              if(avatarChanged && bannerChanged) 
              {
                if(response.data[0].name.includes("avatar"))
                {
                  uploadedAvatarId = response.data[0].id;
                  uploadedBannerId = response.data[1].id;
                }
                else if(response.data[1].name.includes("avatar"))
                {
                  uploadedAvatarId = response.data[1].id;
                  uploadedBannerId = response.data[0].id;
                }
              }
              else if(avatarChanged) uploadedAvatarId = response.data[0].id;
              else if(bannerChanged) uploadedBannerId = response.data[0].id;
              
              // console.log("after take blob : ", uploadedAvatarId);

              if(avatarChanged) 
              {
                currentUser = {...currentUser, avatar : uploadedAvatarId };
              }else {
                currentUser = {...currentUser, avatar : (currentUser.author.avatar ? currentUser.author.avatar.id : null) };
              }
              if(bannerChanged) {
                currentUser = {...currentUser, banner : uploadedBannerId };
              }else{
                currentUser = {...currentUser, banner : (currentUser.author.banner ? currentUser.author.banner.id : null) };
              }
              currentUser = {...currentUser, role : (currentUser.role ? currentUser.role.id : null) };
              currentUser = {...currentUser, author : (currentUser.author ? currentUser.author.id : null) };
                        
              Axios.put(`${api.baseUrl}${api.users}/${currentUser.id}`, currentUser, {}).then(response => {
                if (response && response.status === Code.OK) 
                {
                  NotificationManager.success('Profile just be updated successfully.', 'Success');          
                }
                else {
                  var msg = (response.data && response.data.message && response.data.message) ||
                    (response.message && response.message) || response.toString();
                  if(typeof msg !== "string")  msg = msg[0].messages[0].message;
                  NotificationManager.error(msg, 'Error');
                }
              }).catch(error => {
                var msg = (error.response && error.response.data && error.response.data.message) ||
                  (error.message && error.message) || error.toString();
                  if(typeof msg !== "string")  msg = msg[0].messages[0].message;
                  NotificationManager.error(msg, 'Error');
              })              
              console.log("currentUser.author", currentUser.author);
              if(currentUser.author)
              {
                var dataForUpdateAuthor = {};
                dataForUpdateAuthor = {...dataForUpdateAuthor, "username":currentUser.username};
                dataForUpdateAuthor = {...dataForUpdateAuthor, "name":currentUser.name};
                dataForUpdateAuthor = {...dataForUpdateAuthor, "wallet":currentUser.wallet};
                
                if(avatarChanged)  dataForUpdateAuthor = {...dataForUpdateAuthor, "avatar":currentUser.avatar};
                if(bannerChanged)  dataForUpdateAuthor = {...dataForUpdateAuthor, "banner":currentUser.banner};

                console.log("dataForUpdateAuthor : ", dataForUpdateAuthor);
                
                Axios.put(`${api.baseUrl}${api.authors}/${currentUser.author}`, 
                  dataForUpdateAuthor, {}).then(response => {
                  if (response && response.status === Code.OK) {
                    NotificationManager.success('Image files updated successfully.', 'Success');          
                    dispatch(fetchCurrentUser(currentUser.id));
                    navigate("/explore");
                  }
                  else {
                    var msg = (response.data && response.data.message && response.data.message) ||
                      (response.message && response.message) || response.toString();
                    if(typeof msg !== "string")  msg = msg[0].messages[0].message;
                    NotificationManager.error(msg, 'Error');
                  }
                }).catch(error => {
                  var msg = (error.response && error.response.data && error.response.data.message) ||
                    (error.message && error.message) || error.toString();
                    if(typeof msg !== "string")  msg = msg[0].messages[0].message;
                    NotificationManager.error(msg, 'Error');
                })
              }
            }
            else {
              var msg = (response.data && response.data.message && response.data.message) ||
                (response.message && response.message) || response.toString();
              if(typeof msg !== "string")  msg = msg[0].messages[0].message;
              NotificationManager.errr(msg, 'Error');
            }
          }).catch(error => {
            var msg = (error.response && error.response.data && error.response.data.message) ||
              (error.message && error.message) || error.toString();
            if(typeof msg !== "string")  msg = msg[0].messages[0].message;
            NotificationManager.error(msg, 'Error');
          })
        }
      });
  }
  
  return (
    <div>
      <GlobalStyles />

      { currentUser && 
      <section  className='jumbotron breadcumb no-bg' 
        id='profile_banner' style={{backgroundImage: `url(${currentUser && currentUser.author && currentUser.author.banner ? (api.baseUrl + currentUser.author.banner.url) : `${window.location.origin}/img/banner.jpg` })`}}>
        <div className='mainbreadcumb'>
            <div className='row m-10-hor'>
              <div className='col-12 text-center'>
                <h1>Edit my profile</h1>
              </div>
            </div>
        </div>
      </section>
    } 
      <p></p>
      <div className="col-md-12 offset-md-4">
        <div className="field-set">
          <label><span>When you choose banner image, you can preview at upper this sentence.</span></label><p></p>
          <input type="file" name="bannerFile" onChange={(e) => bannerFileHandler(e)} />                  
        </div>
      </div>

      <section className='container'>

        <div className="col-lg-7 offset-lg-3 mb-5">
          <div id="form-create-item" className="form-border" action="#">
            <div className="lazy item_avatar">
              <CropImage handleChange={handleCropImage} />
              <div name="contactForm" id='contact_form' className="form-border">

                <div className="row">

                  <div className="col-md-6">
                    <div className="field-set">
                      <label>Name:</label>
                      <input type='text' name='name' id='name' className="form-control" defaultValue={currentUser.author && currentUser.author.name && currentUser.author.name} placeholder="Input your Name" onChange={handleChangeEdit} />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="field-set">
                      <label>Username:</label>
                      <input type='text' name='username' id='username' className="form-control" defaultValue={currentUser.username} placeholder="Choose a Username" onChange={handleChangeEdit} />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="field-set">
                      <label>Email Address:</label>
                      <input type='email' name='email' id='email' className="form-control" defaultValue={currentUser.email} placeholder="Input your Email" onChange={handleChangeEdit} />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="field-set">
                      <label>Current Password:</label>
                      <input type='password' name='password' id='password' placeholder="Input current password" className="form-control" onChange={handleChangeEdit} />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="field-set">
                      <label>New Password:</label>
                      <input type='password' name='new_password' id='new_password' placeholder="Input new password" className="form-control" onChange={handleChangeEdit} />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="field-set">
                      <label>Confirm New Password:</label>
                      <input type='password' name='confirm_new_password' id='confirm_new_password' placeholder="Input confirm password" className="form-control" onChange={handleChangeEdit} />
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="field-set">
                      <label>wallet:</label>
                      <input type='text' name='wallet' id='wallet' className="form-control" defaultValue={currentUser.author && currentUser.author.wallet && currentUser.author.wallet} placeholder="Input wallet" onChange={handleChangeEdit} readOnly/>
                    </div>
                  </div>
                  
                  <div className="spacer-10"></div>
                  <div className="col-md-12">
                    <div className="field-set">
                      <label>Summary</label>
                      <textarea data-autoresize name="about" id="profile" defaultValue={currentUser.about} placeholder="Input summary" className="form-control" onChange={handleChangeEdit}></textarea>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div id='button' className="pull-left">
                      <input type="button" id="submit" onClick={() => handleSubmit()} className="btn-main" value="Save" />
                    </div>

                    <div className="clearfix"></div>
                  </div>

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

export default memo(EditProfile);