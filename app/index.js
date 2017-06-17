// app services
const reddcoin = require('./services/reddcoin.js');
const wallet = reddcoin.getWallet();

// angular
browserWallet.controller('addresses', function($scope) {

  /*
    Our Seed Object
   */
  $scope.bip39seed = 'victory pilot network forward trend cup glass grape weird license melody shy';

  /*
    Password
   */
  $scope.password = '';

  /*
    Holds available addresses
   */
  $scope.addresses = {};

  /*
    Holds Payment Data
   */
  $scope.payment = {};

  $scope.loadWallet = function(){
    reddcoin.create($scope.bip39seed, $scope.password); // we wont be asking for real password until required
  }

  $scope.generateSeed = function(){
    $scope.bip39seed = wallet.getNewSeed();
  }

  $scope.formatBalance = function(addr){
    return bitcore.util.formatValue( angular.copy(addr.confirmed) );
  }

  $scope.submitPayment = function( addressToSendFrom ){
    reddcoin.sendPayment($scope.payment.sendTo, $scope.payment.amount, addressToSendFrom, $scope.payment.password);
  }

  /*
    Handle Electrum Data
   */
  electrum.Mediator.event.on('dataReceived', function(data){
    // when we receive the wallet balance update lets update it
    if(data.request.method == "blockchain.address.get_balance"){
      $scope.addresses = wallet.getAddresses();
      $scope.$apply();
    }
  });

});