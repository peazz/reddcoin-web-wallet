// core
import React from 'react';
import {render} from 'react-dom';

// components
import Addresses from './components/Addresses.js';

// services
import reddcoin from './services/reddcoin.js';

// react render ui
//

// create a new wallet
reddcoin.create('victory pilot network forward trend cup glass grape weird license melody shy', 'Asecurepassword@11');

// get the wallet object
const wallet = reddcoin.get();
// listen for data event
electrum.Mediator.event.on('dataReceived', function(data){


  // when we receive the wallet balance update lets update it
  if(data.request.method == "blockchain.address.get_balance"){
    var addresses = wallet.getAddresses();

    render(<Addresses addresses={addresses}/>, document.getElementById('app'));
  }

});



