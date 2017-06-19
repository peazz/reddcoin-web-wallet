  // app services
const reddcoin = require('./services/reddcoin.js');
const wallet = reddcoin.getWalletInstance();

// Angular Services Register
const localStorage = require('./services/ls.js');

// angular directives
require('./directives/ngClickCopy.js');


// angular bootstrap
const modal = require('angular-ui-bootstrap/src/modal/index-nocss.js');

// set wallet
window.wallet = wallet; // access it anywhere
browserWallet = angular.module('browserWallet', [modal, 'ngClickCopy']);
browserWallet.service('LocalStorageService', localStorage);

// angular
browserWallet.controller('addresses', function($scope, $uibModal, $timeout) {

  $scope.start = {
    bip39seed: 'victory pilot network forward trend cup glass grape weird license melody shy',//'victory pilot network forward trend cup glass grape weird license melody shy',
    password: ''
  };

  // tipjar?
  $scope.tipjar = {};

  // holds overal account details
  $scope.account = {
    confirmed:0,
    unconfirmed: 0
  };

  $scope.depositAddress = '';

  // addresses
  $scope.addresses = {};

  // transactions
  $scope.transactions = [];

  // outgoing payment data
  $scope.payment = {
    sendTo: '',
    amount: '',
    password: '',
    error: false
  };

  // show seed form
  $scope.showForm = true;

  // data is loading
  $scope.isLoading = false;

  // usd exchange rate
  $scope.exchangeRate = 0.1;

  // misc data - will clean stuff into here
  $scope.misc = {
    copied: false
  };

  /*
    Wallet Functions
   */
  $scope.loadWallet = function(){
    $scope.isLoading = true;
    reddcoin.create($scope.start.bip39seed, $scope.start.password); // we wont be asking for real password until required
    $scope.start.password = ''; // clear the password
  }

  $scope.generateSeed = function(){
    $scope.start.bip39seed = wallet.getNewSeed();
  }

  /*
    Balances are returned with - attached
    detects if minus value, makes it an abs,
    reforms after
   */
  $scope.formatBalance = function(num){

    let isNegative = false;

    if(num < 0){
      isNegative = true;
      num = Math.abs(num);
    }
    num = bitcore.util.formatValue( angular.copy(num) );

    return isNegative ? ('-' + num) : num ;
  }

  $scope.submitPayment = function( addressToSendFrom ){

    let error = false;

    $scope.isLoading = true; // were loading
    $scope.payment.error = false; // reset any errors

    try {
      reddcoin.sendPayment($scope.payment.sendTo, $scope.payment.amount, addressToSendFrom, $scope.payment.password, $scope.bip39seed, function(){
        // blank cb, but functionality exists ;)
      });
     } catch(err){
        if(err){
          error = true;
          $scope.payment.error = 'Unable to send payment, make sure your password is correct';
        }
     }

     if(!error){
      electrum.Mediator.event.emit('transactionAdded');
      $scope.payment = {}; // clear payment object to avoid leaks
     }
  }

  $scope.openPaymentForm = function(size, parentSelector){

    var parentElem = parentSelector ?
      angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;

    var modalInstance = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'sendPaymentModal.html',
      controller: 'addresses',
      size: size
    });

  }

  $scope.formatTransactionDate = function(unixtime){
    var newDate = new Date();
    newDate.setTime(unixtime * 1000);

    return newDate.toUTCString();
  }

  $scope.getEstUsdValue = function(){
    return (bitcore.util.formatValue($scope.account.confirmed) * $scope.exchangeRate).toFixed(7) + ' USD';
  }

  $scope.enableSendButton = function(){

    let address = typeof $scope.payment !== 'undefined' && $scope.payment.sendTo.length > 0  ? true : false;
    let amount = typeof $scope.payment !== 'undefined' && $scope.payment.amount.length > 0 ? true : false;
    let password = typeof $scope.payment !== 'undefined' && $scope.payment.password.length > 0 ? true : false;

    return address && amount && password ? false : true;

  }

  // copies input contents to clipboard
  $scope.copyToClipBoard = function(){

  }

  /*
    Helpers
   */
  $scope.paymentFormIndex = -1;
  $scope.showPaymentForm = function(index){
    if($scope.paymentFormIndex === index){
      $scope.paymentFormIndex = -1;
    } else {
      $scope.paymentFormIndex = index;
    }
  }

  /*
    Handle Electrum Data
   */

  // browser api creates addresses
  electrum.Mediator.event.on('addressCreated', function(data){

    if(typeof $scope.addresses[ data.address ] === 'undefined'){
      $scope.addresses[ data.address ] = {}
    }

    $scope.depositAddress = wallet.getAddresses()[0];
    $scope.addresses[ data.address ] = data;
    $scope.showForm = false;
    $scope.$evalAsync();

  });

  // wallet transaction
  electrum.Mediator.event.on('transactionAdded', function( ){
    $scope.transactions = wallet.getTransactions();
    $scope.account = wallet.getAccountInfo()[0];
    $scope.tipjar = wallet.getTipJar();
    $scope.$evalAsync();
  });

  electrum.Mediator.event.on('idle', function(data){
    $scope.isLoading = false;
    $scope.$evalAsync();
  });

  // anything in from requests here
  electrum.Mediator.event.on('dataReceived', function(data){
    // when we receive the wallet balance update lets update it
    if(data.request.method == "blockchain.address.get_balance"){
      //$scope.addresses = wallet.getAddresses();
      //$scope.$apply();
    }
  });

  // cross controller comms
  $scope.$on('usdUpdate', function(event, data){
    $scope.exchangeRate = data;
  });

  // handles address copy event - emited from directive
  $scope.$on('copied', function(){
    $scope.misc.copied = true;

    $timeout(function(){
      $scope.misc.copied = false;
    }, 2500);
    $scope.$evalAsync();
  });

});

/*
  Handles the ticker
 */
browserWallet.controller('ticker', function($scope, $http, $interval, LocalStorageService) {

  // reddcoin ticker api url
  $scope.marketDataUrl = 'http://api.coinmarketcap.com/v1/ticker/reddcoin/';

  // holds reddcoin market data
  $scope.marketData = {
    loading: true,
    info: {}
  };

  $scope.getPriceTickerData = function(){

    if( LocalStorageService.get('rddTickerData') ){

      $scope.marketData.info = JSON.parse( LocalStorageService.get('rddTickerData') );
      $scope.marketData.loading = false;

      $scope.$emit('usdUpdate', $scope.marketData.info.price_usd ); // sends exchange rate to master controller above

    } else {

      $http.get($scope.marketDataUrl).then(function(response) {
        let data = JSON.stringify(response.data[0]);
        LocalStorageService.set('rddTickerData', data);
        $scope.marketData = JSON.parse(data);
        $scope.marketData.loading = false;
        $scope.$emit('usdUpdate', $scope.marketData.info.price_usd );  // sends exchange rate to master controller above
      });

    }

    // start fetching on timer
    $scope.intervalGetPriceTickerData();

  }

  $scope.intervalGetPriceTickerData = function(){
    $interval(function(){
      $scope.marketData.loading = true;
      $http.get($scope.marketDataUrl).then(function(response) {
        let data = JSON.stringify(response.data[0]);
        LocalStorageService.set('rddTickerData', data);
        $scope.marketData.info = JSON.parse( data);
        $scope.$emit('usdUpdate', $scope.marketData.info.price_usd );  // sends exchange rate to master controller above
        $scope.marketData.loading = false;
      });
    }, 10000);
  }

  $scope.setPercentageColor = function( number ){
    if(number < 0){
      return 'percentage-down';
    } else {
      return 'percentage-up';
    }
  }

  /*
    Start
   */
  $scope.init = function(){
    $scope.getPriceTickerData();
  }

  $scope.init();

});