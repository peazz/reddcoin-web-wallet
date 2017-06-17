// app services
const reddcoin = require('./services/reddcoin.js');
const wallet = reddcoin.getWallet();

// Angular Services Register
const localStorage = require('./services/ls.js');
browserWallet.service('LocalStorageService', localStorage);

// controllers
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

    } else {

      $http.get($scope.marketDataUrl).then(function(response) {
        let data = JSON.stringify(response.data[0]);
        LocalStorageService.set('rddTickerData', data);
        $scope.marketData = JSON.parse(data);
        $scope.marketData.loading = false;
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

// angular
browserWallet.controller('addresses', function($scope) {


  // wallet seed
  $scope.bip39seed = 'victory pilot network forward trend cup glass grape weird license melody shy';

  // temp password
  $scope.password = '';

  // addresses
  $scope.addresses = {};

  // transactions
  $scope.transactions = [];

  // outgoing payment data
  $scope.payment = {};

  // show seed form
  $scope.showForm = true;

  $scope.isLoading = false;

  /*
    Wallet Functions
   */
  $scope.loadWallet = function(){
    reddcoin.create($scope.bip39seed, $scope.password); // we wont be asking for real password until required
    $scope.isLoading = true;
  }

  $scope.generateSeed = function(){
    $scope.bip39seed = wallet.getNewSeed();
  }

  $scope.formatBalance = function(num){
    return bitcore.util.formatValue( angular.copy(num) );
  }

  $scope.submitPayment = function( addressToSendFrom ){
    reddcoin.sendPayment($scope.payment.sendTo, $scope.payment.amount, addressToSendFrom, $scope.payment.password);
    $scope.isLoading = true;
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

    $scope.addresses[ data.address ] = data;
    $scope.showForm = false;
    $scope.$evalAsync();
  });

  // wallet transaction
  electrum.Mediator.event.on('transactionAdded', function( ){
    $scope.transactions = wallet.getTransactions();
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


});