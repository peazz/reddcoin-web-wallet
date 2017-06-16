import React from 'react'

function Addresses (props) {

  var addresses = props.addresses;
  var parts = '';

  for(var i = 0; i < addresses.length; i++){
    var addr = addresses[i];
    var val = bitcore.util.formatValue(addr.confirmed) + ' RDD';

    parts += '<div data-id="'+ addr.address +'">Address ('+ addr.address  +') #' + i + ': <span class="value">' + val + '</span></div>';
  }

  return (
    <div id="addresses" dangerouslySetInnerHTML={{__html: parts}}></div>
  )
}

export default Addresses