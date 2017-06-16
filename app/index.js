// core
import React from 'react';
import {render} from 'react-dom';

// react components
import Addresses from './components/Addresses.jsx';

// app services
import reddcoin from './services/reddcoin.js';

const wallet = reddcoin.get();

// create / recover a new wallet
let loadWalletButton = $('#load-wallet');
loadWalletButton.click(function(){
  let seed = $('input[name=bip39seed]').val();
  let password = 'dummy'; // we wont require a password until an unlock is required
  reddcoin.create(seed, password);
});

// generate a seed
let generateSeedButton = $('#generate-seed');
generateSeedButton.click(function(){
  let seed = wallet.getNewSeed();
  $('input[name=bip39seed]').val(seed);
});


// listen for data event emitted from electrum api
electrum.Mediator.event.on('dataReceived', function(data){

  // when we receive the wallet balance update lets update it
  if(data.request.method == "blockchain.address.get_balance"){
    var addresses = wallet.getAddresses();
    render(<Addresses addresses={addresses} wallet={wallet}/>, document.getElementById('address-list'));
  }

});