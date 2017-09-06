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
browserWallet.controller('addresses', function($scope, $uibModal, $timeout, $rootScope) {

  $scope.start = {
    bip39seed: '',//'victory pilot network forward trend cup glass grape weird license melody shy',
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

    let type;

    $scope.isLoading = true;

    if( typeof $scope.start.password === 'undefined' || $scope.start.password.length === 0 ){
      type = 'watch'; // cant send payments
    } else {
      type = 'encrypted'; // can send payments
    }

    $scope.account = type;

    if(type == 'watch'){

      // user wont be able to spend
      if(confirm('You didn\'t enter a password so you wont be able to make transactions, are you sure you want to do this?')){
        $scope._createWallet('watch');
      }

    } else {
       $scope._createWallet(type);
    }

  }


  $scope._createWallet = function(type){
    reddcoin.create($scope.start.bip39seed, $scope.start.password, type); // we wont be asking for real password until required
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

    if(typeof num !== 'undefined'){

      let isNegative = false;

      if(num < 0){
        isNegative = true;
        num = Math.abs(num);
      }

      num = bitcore.util.formatValue( angular.copy(num) );

      return isNegative ? ('-' + num) : num ;

    } else {

      return 0.00;
    }
  }

  /*
    Submit Wallet Payment
   */
  $scope.submitPayment = function( form, addressToSendFrom ){

    let sendError = false; // no send error
    let validations = true; // all validations pass by default

    $scope.isLoading = true; // were loading
    $scope.payment.error = false; // reset any errors

    // validate payment data
    if(!$scope.isValidAddress($scope.payment.sendTo)){
      $scope.paymentForm.sendTo.$setValidity("incorrectAddress", false); // custom form error for message
      validations = false; // failed
    }

    // validations pass lets go
    if(validations){

      // exec
      try {
        reddcoin.sendPayment($scope.payment.sendTo, $scope.payment.amount, addressToSendFrom, $scope.payment.password, $scope.bip39seed, function(){
          // blank cb, but functionality exists ;)
        });
       } catch(err){
          if(err){
            sendError = true;
            $scope.payment.error = 'Unable to send payment, make sure your password is correct';
          }
       }

       // payment was a success
       if(!sendError){
        // force ui update
        electrum.Mediator.event.emit('transactionAdded');
        // reset the model and ui
        $scope.payment = {};
       }

     }
  }

  $scope.isValidAddress = function(address){
    return !bitcore.Address.validate(address) ? false : true;
  }

  /*
    Get Human Readable Date from
    Unix Timestamp
   */
  $scope.formatTransactionDate = function(unixtime){
    var newDate = new Date();
    newDate.setTime(unixtime * 1000);

    return newDate.toUTCString();
  }

  $scope.getEstUsdValue = function(){
    if(typeof $scope.account.confirmed === 'undefined' || typeof $scope.exchangeRate  === 'undefined') {
      return '0.00 USD';
    }

    return (bitcore.util.formatValue($scope.account.confirmed) * $scope.exchangeRate).toFixed(7) + ' USD';
  }

  /*
    Checks if account is watch type
   */
  $scope.isAccountSpendable = function(){
    return $scope.account.typeName === 'Unspendable' ? true : false;
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

  $scope.enableSendButton = function(){
    return $scope.paymentForm.$valid ? false : true;
  }

  $scope.checkHasEnoughFunds = function(){

    if(typeof $scope.account.confirmed === 'undefined'){
      $scope.paymentForm.sendTo.$setValidity("notEnoughFunds", false); // custom form error for message
      return;
    }

    /*
      TODO: test more, not sure how this works with more decimel places
     */
    let hasFunds =  $scope.payment.amount > bitcore.util.formatValue($scope.account.confirmed) ? false : true;

    // validate payment data
    if(!hasFunds){
      $scope.paymentForm.sendTo.$setValidity("notEnoughFunds", false); // custom form error for message
    } else {
      $scope.paymentForm.sendTo.$setValidity("notEnoughFunds", true); // custom form error for message
    }
  }

  $scope.sendButtonTitle = function(){
    if($scope.account.type === 'watch'){
      return 'You didn\'t provide a password when you opened your wallet so you cannot send payments.';
    } else {
      return 'Send Reddcoin Instantly';
    }
  }

  /*
    When a user writes, pastes or changes
    the to address, check if its valid
    and set invalud if not on the form
   */
  $scope.checkIsValidAddressOnChange = function(){
    // validate payment data
    if(!$scope.isValidAddress($scope.payment.sendTo)){
      $scope.paymentForm.sendTo.$setValidity("incorrectAddress", false); // custom form error for message
    } else {
      $scope.paymentForm.sendTo.$setValidity("incorrectAddress", true); // custom form error for message
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


    $timeout(function(){
      $scope.transactions = wallet.getTransactions();
      $scope.account = wallet.getAccountInfo()[0];
      $scope.tipjar = wallet.getTipJar();
    }, 3000);

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
  Get the latest Reddit Posts
 */
browserWallet.controller('redditPosts', function($scope, $http, $interval, LocalStorageService) {

  $scope.postsUrl = 'https://www.reddit.com/r/reddCoin/new.json?sort=new';

  $scope.posts = {};

  $scope.loading = true;

  $scope.getRedditData = function(){
    if( LocalStorageService.get('redditPosts') ){
      $scope.posts = JSON.parse( LocalStorageService.get('redditPosts') );
      $scope.loading = false;
    } else {
      $http.get($scope.postsUrl).then(function(response) {
        let data = JSON.stringify(response.data.data.children);
        LocalStorageService.set('redditPosts', data);
        $scope.posts = JSON.parse(data);
        $scope.loading = false;
      });
    }

    $scope.intervalGetPriceTickerData(); // update on timer
  }

  $scope.intervalGetPriceTickerData = function(){
    $interval(function(){
      $scope.loading = true;
      $http.get($scope.postsUrl).then(function(response) {
        let data = JSON.stringify(response.data.data.children);
        LocalStorageService.set('redditPosts', data);
        $scope.posts = JSON.parse(data);
        $scope.loading = false;
      });
    }, 1000000);
  }

  $scope.getCommentsNumber = function(num){

    if(num === 1){
      return '1 Comment';
    } else {
      return num + ' Comments'
    }

  }

  $scope.formatDate = function(unixtime){
    var newDate = new Date();
    newDate.setTime(unixtime * 1000);

    return newDate.toUTCString();
  }

  $scope.getRedditData();

});

/*
  Handle the ticker
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