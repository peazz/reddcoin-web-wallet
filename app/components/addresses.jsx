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
    <div>
      <h1>Associated Addresses</h1>
      <div dangerouslySetInnerHTML={{__html: parts}}></div>
    </div>
  )
}

export default Addresses