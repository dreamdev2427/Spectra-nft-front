import Web3 from 'web3';
import { create } from 'ipfs-http-client';
import api from '../api';
require("dotenv").config();
const Axios = require('axios');
const nftContractAddressABI = require("./nftContract-abi.json");
const nftContractAddress = "0x6dd5f1cbb3A388f910231759b9100Aebc5B8DDFA";
const contractABI = require("./contract-abi.json");
const contractAddress = "0xC5Dd78d9fB5f7a222e209241f9aBC11A12Ff818a";

export const ipfsAddress = "https://ipfs.infura.io/ipfs/";
export const loadWeb3 = async () => {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    window.web3.eth.handleRevert = true
  } else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    window.web3.eth.handleRevert = true
  } else {
    window.alert(
      "Non-Ethereum browser detected. You should consider trying MetaMask!"
    );
  }
};

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const obj = {
        status: "Metamask successfuly connected.",
        address: addressArray[0],
      };
      return obj;
    } catch (err) {
      return {
        address: "",
        status: "Something went wrong: " + err.message,
      };
    }
  }
  else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" rel="noreferrer" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual BSC wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: "Fill in the text-field above.",
        };
      } else {
        return {
          address: "",
          status: "🦊 Connect to Metamask using the top right button.",
        };
      }
    } catch (err) {
      return {
        address: "",
        status: "Something went wrong: " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" rel="noreferrer" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual BSC wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const createNftFile = async (file, title, description) => {
  const client = create('https://ipfs.infura.io:5001/api/v0')
  try {
    const image_hash = await client.add(file);
    const metadata = JSON.stringify({
      name: title,
      description: description,
      image: api.ipfsUrl + image_hash.cid.toString()
    });
    const meta_hash = await client.add(metadata);
    const token_uri = api.ipfsUrl + meta_hash.cid.toString();
    return {
      success: true,
      image_uri: api.ipfsUrl + image_hash.cid.toString(),
      token_uri: token_uri
    }
  } catch (error) {
    return {
      success: false,
      error: 'Error uploading file: ' + error
    }
  }
};

export const getCurrentWallet = async () => {
  const web3 = window.web3;
  try {
    let accounts = await web3.eth.getAccounts();
    let accountBalance = await web3.eth.getBalance(accounts[0]);
    accountBalance = web3.utils.fromWei(accountBalance);
    return {
      success: true,
      account: accounts[0],
      balance: accountBalance
    }
  } catch (error) {
    return {
      success: false,
      result: "Something went wrong: " + error.message
    }
  }
}

export const mintNFT = async (formData) => {
  let auctionInterval = formData.deadline ?  formData.deadline: 0;
  if (auctionInterval < 0 || isNaN(auctionInterval) || formData.status !== 'on_auction') {
    auctionInterval = 0;
  }
  auctionInterval = Math.floor(auctionInterval);

  if (!formData) {
    return {
      success: false,
      status: "Something went wrong while uploading your tokenURI.",
    };
  }
  let tokenURI, imageURI;
  const result = await createNftFile(formData.preview_image, formData.title, formData.description);
  if (result.success) {
    imageURI = result.image_uri;
    tokenURI = result.token_uri;
    console.log('[imageURI] = ', imageURI);
    console.log('[tokenURI] = ', tokenURI);
  }
  else {
    return {
      success: false,
      status: result.error,
    };
  }

  let imageURIs = [imageURI];
  const searchRes = await searchNFT(imageURIs);
  if (searchRes.success) {
    return {
      success: false,
      status: "Duplicate NFT: \n" + searchRes.data.toString()
    }
  }

  let itemPrice = formData.status === 'buy_now' ? formData.price : formData.priceover;
  if (formData.status === 'has_offers') {
    itemPrice = 0;
  }
  const author = formData.author_info;
  const royalties = formData.royalties;
  const tokenType = formData.token_type === 'BNB' ? 0 : 1;

  const web3 = window.web3;
  try {
    window.contract = await new web3.eth.Contract(contractABI, contractAddress);
  } catch (error) {
    return {
      success: false,
      status: "Something went wrong 1: " + error.message,
    };
  }

  try {
    let accounts = await web3.eth.getAccounts();
    let item_price = web3.utils.toWei(itemPrice !== null ? itemPrice.toString() : '0', 'ether');
    let mintingFee = web3.utils.toWei(author.minting_fee !== null ? author.minting_fee.toString() : '0', 'ether');
    let tx = await window.contract.methods.singleMintOnSale(tokenURI, auctionInterval, item_price, royalties, tokenType).send({ from: accounts[0], value: mintingFee });
   
    const activity = {
      from: accounts[0],
      to: contractAddress,
      price: itemPrice,
      token_type: formData.token_type,
      nft: tokenURI,
      status: 'MINT'
    }
    await sendActivity(activity);
    return {
      success: true,
      imageURI: imageURI,
      tokenURI: tokenURI,
      status:
        `Check out your transaction on BSC: <a target="_blank" href="https://testnet.bscscan.com/tx/${tx.transactionHash}">${tx.transactionHash}</a>`
    };
  } catch (error) {
    return {
      success: false,
      status: "Something went wrong 2: " + error.message,
    };
  }
}

export const mintBatchNFT = async (formData, files) => {
  if (!formData) {
    return {
      success: false,
      status: "Something went wrong while uploading your tokenURI.",
    };
  }

  let ipfsTokenArray = [], ipfsImageArray = [];
  for (let index in files) {
    const result = await createNftFile(files[index], formData.title, formData.description);
    if (result.success) {
      ipfsImageArray.push(result.image_uri);
      ipfsTokenArray.push(result.token_uri);
      console.log('[ipfsImageURIs] = ', ipfsImageArray);
      console.log('[ipfsTokenArray] = ', ipfsTokenArray);
    } else {
      return {
        success: false,
        status: result.error,
      };
    }
  }
  
  const searchRes = await searchNFT(ipfsImageArray);
  if (searchRes.success) {
    return {
      success: false,
      status: "Duplicate NFT: \n" + searchRes.data.toString()
    }
  }
  const itemPrice = formData.status === 'buy_now' ? formData.price : 0;
  const author = formData.author_info;
  const royalties = formData.royalties;
  const tokenType = formData.token_type === 'BNB' ? 0 : 1;
  const web3 = window.web3;
  try {
    window.contract = await new web3.eth.Contract(contractABI, contractAddress);
  } catch (error) {
    return {
      success: false,
      status: "Something went wrong 1: " + error.message,
    };
  }
  try {
    let accounts = await web3.eth.getAccounts();
    let item_price = web3.utils.toWei(itemPrice !== null ? itemPrice.toString() : '0', 'ether');
    let temp_mintingFee = author.minting_fee * ipfsTokenArray.length;
    let mintingFee = web3.utils.toWei(author.minting_fee !== null ? temp_mintingFee.toString() : '0', 'ether');

    let tx = await window.contract.methods.batchMintOnSale(ipfsTokenArray, item_price, royalties, tokenType).send({ from: accounts[0], value: mintingFee });

    const activity = {
      from: accounts[0],
      to: contractAddress,
      price: itemPrice,
      token_type: formData.token_type,
      nfts: ipfsImageArray,
      status: 'MINT'
    }
    await sendActivity(activity, '/multi');
    return {
      success: true,
      imageURIs: ipfsImageArray,
      tokenURIs: ipfsTokenArray,
      status:
        `Check out your transaction on BSC: <a target="_blank" href="https://testnet.bscscan.com/tx/${tx.transactionHash}">${tx.transactionHash}</a>`
    };
  } catch (error) {
    return {
      success: false,
      status: "Something went wrong 2: " + error.message,
    };
  }
}

export const buyNFT = async (nft, curUser, curPrice) => {
  if (curUser === undefined || curUser === "") return {
    success: false,
    status: "No buyer."
  }
  window.web3 = new Web3(window.web3.currentProvider)
  const web3 = window.web3;
  try {
    window.contract = await new web3.eth.Contract(contractABI, contractAddress);
  } catch (error) {
    return {
      success: false,
      status: "Something went wrong 1: " + error.message,
    };
  }

  try {
    if (nft.author.wallet === undefined || nft.author.wallet === null || nft.author.wallet === "") {
      return {
        success: false,
        status: "You havn't your wallet."
      };
    }
    if (nft.token_uri === undefined || nft.token_uri === null || nft.token_uri === "") {
      return {
        success: false,
        status: "NFT dosen't have IPFS address."
      };
    }
  } catch (err) {
    return {
      success: false,
      status: "Something went wrong 2: " + err.message,
    };
  }

  try {
    await window.contract.methods.performBid(nft.token_uri).send({ from: curUser.author.wallet });
  } catch (error) {
    return {
      success: false,
      status: 'Something went wrong 3: ' + error.message
    }
  }

  ///*chage the ownership of saling NFT with buyer's id *///
  await Axios.put(`${api.baseUrl}${api.nfts}/${nft.id}`, { "author": curUser.author.id, "situation": "saled", "bids": [], "deadline": null, "price": curPrice }, {
    params: {},
  }).catch(err => {
    return {
      success: false,
      status: "Something went wrong 4: " + err.message,
    };
  });
  /*add saling NFT to it's buyer's list *///
  var nftsOfCustomer = curUser.author.nfts ? curUser.author.nfts : [];
  var nftsToUpdateCustomer = [];
  nftsOfCustomer.forEach(element => {
    nftsToUpdateCustomer = [...nftsToUpdateCustomer, element.id];
  });
  nftsToUpdateCustomer = [...nftsToUpdateCustomer, nft.id];

  const activity = {
    from: nft.author.wallet,
    to: curUser.author.wallet,
    price: curPrice,
    token_type: nft.token_type,
    nft: nft.unique_id,
    status: 'BUY'
  };
  console.log('[Activity]', activity);
  await sendActivity(activity);

  await Axios.put(`${api.baseUrl}${api.authors}/${curUser.author.id}`, { "nfts": nftsToUpdateCustomer }, {
    params: {},
  }).catch(err => {
    return {
      success: false,
      status: "Something went wrong 5: " + err.message,
    };
  });
  return {
    success: true,
    status: `Successfully bought it!`,
  };
}

export const sellNFT = async (nft, topBidder, curPrice) => 
{
  if (topBidder === undefined || topBidder === "") return {
    success: false,
    status: "No top bidder."
  }
  window.web3 = new Web3(window.web3.currentProvider);
  const web3 = window.web3;
  try {
    window.contract = await new web3.eth.Contract(contractABI, contractAddress);
  } catch (error) {
    return {
      success: false,
      status: "Something went wrong 1: " + error.message,
    };
  }

  try {
    if (nft.author.wallet === undefined || nft.author.wallet === null || nft.author.wallet === "") {
      return {
        success: false,
        status: "You havn't your wallet."
      };
    }
    if (nft.token_uri === undefined || nft.token_uri === null || nft.token_uri === "") {
      return {
        success: false,
        status: "NFT dosen't have IPFS address."
      };
    }

    await window.contract.methods.performBid(nft.token_uri).send({from: nft.author.wallet});

    const activity = {
      from: nft.author.wallet,
      to: topBidder.wallet,
      price: curPrice,
      token_type: nft.token_type,
      nft: nft.unique_id,
      status: 'SELL'
    }
    await sendActivity(activity);

    ///*chage the ownership of saling NFT with buyer's id *///
    await Axios.put(`${api.baseUrl}${api.nfts}/${nft.id}`, { "author": topBidder.id, "situation": "saled", "bids": [], "deadline": null, "price": curPrice }, {
      params: {},
    }).catch(err => {
      return {
        success: false,
        status: "Something went wrong 2: " + err.message,
      };
    });

    /*add saling NFT to it's buyer's list *///
    var nftsOfCustomer = topBidder.nfts ? topBidder.nfts : [];
    var nftsToUpdateCustomer = [];
    nftsOfCustomer.forEach(element => {
      nftsToUpdateCustomer = [...nftsToUpdateCustomer, element.id];
    });
    nftsToUpdateCustomer = [...nftsToUpdateCustomer, nft.id];
    await Axios.put(`${api.baseUrl}${api.authors}/${topBidder.id}`, { "nfts": nftsToUpdateCustomer }, {
      params: {},
    }).catch(err => {
      return {
        success: false,
        status: "Something went wrong 3: " + err.message,
      };
    });
    return {
      success: true,
      status: `Successfully sold it!`,
    };
  } catch (err) {
    return {
      success: false,
      status: "Something went wrong 4: " + err.message,
    };
  }
}

export const approveForResell = async (author, tokenHash, token_type, price, deadline, royalty) => {
  var auctionInterval = 0;
  if (deadline > 0) 
    auctionInterval = deadline;

  window.web3 = new Web3(window.web3.currentProvider)
  const web3 = window.web3;
  try {
    window.contract = await new web3.eth.Contract(contractABI, contractAddress);
  } catch (error) {
    return {
      success: false,
      status: "Something went wrong 1: " + error.message,
    };
  }

  try {
    window.new_contract = await new web3.eth.Contract(nftContractAddressABI, nftContractAddress);
  } catch (error) {
    return {
      success: false,
      status: "Something went wrong 2: " + error.message,
    };
  }

  try {
    let tokenType = token_type === 'BNB' ? 0 : 1;
    let item_price = web3.utils.toWei(price !== null ? price.toString() : '0', 'ether');
    await window.new_contract.methods.setApprovalForAll(contractAddress, true).send({ from: author.wallet });
    await window.contract.methods.createSale(tokenHash, auctionInterval, item_price, royalty, tokenType).send({from: author.wallet});

    const activity = {
      from: author.wallet,
      to: contractAddress,
      price: price,
      token_type: token_type,
      nft: tokenHash,
      status: 'RESELL'
    }
    await sendActivity(activity);
    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      status: "Something went wrong 3: " + error.message,
    };
  }
}

export const sendActivity = async (activity, multi = '') => {
  await Axios.post(`${api.baseUrl}${api.activities}${multi}`, activity, {
    params: {},
  }).catch(err => {
    return {
      success: false,
      status: "Something went wrong: " + err.message,
    };
  });
}

export const placeBid = async (nft, bidPrice) => {
  const web3 = window.web3;
  try {
    window.contract = await new web3.eth.Contract(contractABI, contractAddress);
  } catch (error) {
    return {
      success: false,
      status: "Something went wrong 1: " + error.message,
    };
  }

  try {
    if (nft.author.wallet === undefined || nft.author.wallet === null || nft.author.wallet === "") {
      return {
        success: false,
        status: "You havn't your wallet."
      };
    }
    if (nft.token_uri === undefined || nft.token_uri === null || nft.token_uri === "") {
      return {
        success: false,
        status: "NFT dosen't have IPFS address."
      };
    }
    let accounts = await web3.eth.getAccounts();
    let nftPrice = web3.utils.toWei(bidPrice !== null ? bidPrice.toString() : '0', 'ether');
    await window.contract.methods.placeBid(nft.token_uri).send({ from: accounts[0], value: nftPrice });

    const activity = {
      from: accounts[0],
      to: nft.author.wallet,
      price: bidPrice,
      token_type: nft.token_type,
      nft: nft.unique_id,
      status: 'BID'
    }
    await sendActivity(activity);
    return {
      success: true,
    };
  } catch (err) {
    return {
      success: false,
      status: "Something went wrong: " + err.message,
    };
  }
}

export const destroySale = async (nftHash) => {
  const web3 = window.web3;
  try {
    window.contract = await new web3.eth.Contract(contractABI, contractAddress);
  } catch (error) {
    return {
      success: false,
      status: "Something went wrong: " + error.message,
    };
  }

  try {
    if (nftHash === undefined) {
      return {
        success: false,
        status: "NFT dosen't have IPFS address."
      };
    }
    let accounts = await web3.eth.getAccounts();
    await window.contract.methods.destroySale(nftHash).send({ from: accounts[0] });

    return {
      success: true,
    };
  } catch (err) {
    return {
      success: false,
      status: "Something went wrong: " + err.message,
    };
  }
}


export const searchNFT = async (tokenURIs) => {
  try {
    const { data } = await Axios.post(`${api.baseUrl}${api.nfts}/search`,
    { "data": tokenURIs },{
      params: {},
    });
    return {
      success: data.success,
      data: data.data
    }
  } catch (error) {
    return {
      success: false,
      error
    }
  } 
}