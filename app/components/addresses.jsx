import React from 'react'


let transactions = {}

/**
 * formats the transactions into a associative
 * array
 */
function getFormattedTransactions( array ){

  for(let i = 0; i < array.length; i++){

    if(typeof transactions[ array[i].address ] === 'undefined'){
      transactions[ array[i].address ] = {};
    }

    transactions[ array[i].address ][ array[i].id ] = array[0]
  }


}



/**
 * Address Component
 * @param {[type]} props [description]
 */
function Addresses (props) {

  function sendPayment(address){
    alert(address);
  }


  var addresses = props.addresses;
  var wallet = props.wallet;
  var parts = '';

  if(addresses.length > 0){

    // setup the transaction object
    getFormattedTransactions( wallet.getTransactions() )

    for(var i = 0; i < addresses.length; i++){
      var addr = addresses[i];
      var val = bitcore.util.formatValue(addr.confirmed) + ' RDD';

      parts += '<div class="address__item">';
      parts += 'Address ('+ addr.address  +') #' + i + ': ' + val;

      /*
        If the address has transactions
       */
      if(typeof transactions[addr.address] !== 'undefined'){
        parts += '<ul class="transactions">';
        parts  += '<li class="transactions__header">Transactions</li>';
        for( let transaction in transactions[addr.address] ){

          let current = transactions[addr.address][transaction];
          let type = current.type;
          let total = bitcore.util.formatValue(current.total);
          let id = '<a href="https://live.reddcoin.com/tx/' + current.id + '" target="_blank">'+ current.id +'</a>';


          parts += '<li class="transaction"><span class="transaction__type transaction__type-'+ type +'">'+ type +'</span> '+ id +': '+ total +' RDD</li>';
        }

        parts += '</ul>';
      }

      /*
        Send a transaction
       */
      if( bitcore.util.formatValue(addr.confirmed) !== '0.00' ){
        parts += '<div class="address__item-send">';
        parts += '<h3>Send a Payment</h3>';
        parts += '<input type="text" data-id="'+ addr.address +'" style="width:auto;" placeholder="Amount to Send">';
        parts += '<input type="password" data-password-id="'+ addr.address +'" style="width:auto;" placeholder="Password">';
        parts += '<button onClick={this.sendPayment.bind(this, addr.address)}>Send Payment</button>';
        parts += '</div>';
      }

      parts += '</div>';
    }
  }

  return (
    <div>
      <h1>Associated Addresses</h1>
      <div className="address-info" dangerouslySetInnerHTML={{__html: parts}}></div>
    </div>
  )
}

export default Addresses