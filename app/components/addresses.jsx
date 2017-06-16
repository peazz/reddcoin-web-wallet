import React from 'react'

function Addresses (props) {

  var addresses = props.addresses;
  var parts = '';

  for(var i = 0; i < addresses.length; i++){
    var addr = addresses[i];
    var val = bitcore.util.formatValue(addr.confirmed) + ' RDD';

    parts += '<div>Address ('+ addr.address  +') #' + i + ': ' + val + '</div>';
  }

  return (
    <div id="addresses" dangerouslySetInnerHTML={{__html: parts}}></div>
  )
}

export default Addresses