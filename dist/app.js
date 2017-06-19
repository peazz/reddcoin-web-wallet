/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	// app services
	var reddcoin = __webpack_require__(1);
	var wallet = reddcoin.getWalletInstance();
	window.wallet = wallet;

	// Angular Services Register
	var localStorage = __webpack_require__(2);
	browserWallet.service('LocalStorageService', localStorage);

	// directives


	// angular
	browserWallet.controller('addresses', function ($scope) {

	  $scope.start = {
	    bip39seed: 'victory pilot network forward trend cup glass grape weird license melody shy', //'victory pilot network forward trend cup glass grape weird license melody shy',
	    password: ''
	  };

	  // tipjar?
	  $scope.tipjar = {};

	  // holds overal account details
	  $scope.account = {
	    confirmed: 0,
	    unconfirmed: 0
	  };

	  // addresses
	  $scope.addresses = {};

	  // transactions
	  $scope.transactions = [];

	  // outgoing payment data
	  $scope.payment = {};

	  // show seed form
	  $scope.showForm = true;

	  // show
	  $scope.isLoading = false;

	  /*
	    Wallet Functions
	   */
	  $scope.loadWallet = function () {
	    $scope.isLoading = true;
	    reddcoin.create($scope.start.bip39seed, $scope.start.password); // we wont be asking for real password until required
	    $scope.start.password = ''; // clear the password
	  };

	  $scope.generateSeed = function () {
	    $scope.start.bip39seed = wallet.getNewSeed();
	  };

	  $scope.formatBalance = function (num) {
	    return bitcore.util.formatValue(angular.copy(num));
	  };

	  $scope.submitPayment = function (addressToSendFrom) {
	    $scope.isLoading = true;
	    reddcoin.sendPayment($scope.payment.sendTo, $scope.payment.amount, addressToSendFrom, $scope.payment.password, $scope.bip39seed, function () {
	      electrum.Mediator.event.emit('transactionAdded');
	      $scope.payment = {}; // clear payment object
	    });
	  };

	  /*
	    Helpers
	   */
	  $scope.paymentFormIndex = -1;
	  $scope.showPaymentForm = function (index) {
	    if ($scope.paymentFormIndex === index) {
	      $scope.paymentFormIndex = -1;
	    } else {
	      $scope.paymentFormIndex = index;
	    }
	  };

	  /*
	    Handle Electrum Data
	   */

	  // browser api creates addresses
	  electrum.Mediator.event.on('addressCreated', function (data) {

	    if (typeof $scope.addresses[data.address] === 'undefined') {
	      $scope.addresses[data.address] = {};
	    }

	    $scope.addresses[data.address] = data;
	    $scope.showForm = false;
	    $scope.$evalAsync();
	  });

	  // wallet transaction
	  electrum.Mediator.event.on('transactionAdded', function () {
	    $scope.transactions = wallet.getTransactions();
	    $scope.account = wallet.getAccountInfo()[0];
	    $scope.tipjar = wallet.getTipJar();

	    console.log($scope.account);
	    console.log(wallet.getTipJar());

	    $scope.$evalAsync();
	  });

	  electrum.Mediator.event.on('idle', function (data) {
	    $scope.isLoading = false;
	    $scope.$evalAsync();

	    //console.log(wallet);
	  });

	  // anything in from requests here
	  electrum.Mediator.event.on('dataReceived', function (data) {
	    // when we receive the wallet balance update lets update it
	    if (data.request.method == "blockchain.address.get_balance") {
	      //$scope.addresses = wallet.getAddresses();
	      //$scope.$apply();
	    }
	  });
	});

	// controllers
	browserWallet.controller('ticker', function ($scope, $http, $interval, LocalStorageService) {

	  // reddcoin ticker api url
	  $scope.marketDataUrl = 'http://api.coinmarketcap.com/v1/ticker/reddcoin/';

	  // holds reddcoin market data
	  $scope.marketData = {
	    loading: true,
	    info: {}
	  };

	  $scope.getPriceTickerData = function () {

	    if (LocalStorageService.get('rddTickerData')) {

	      $scope.marketData.info = JSON.parse(LocalStorageService.get('rddTickerData'));
	      $scope.marketData.loading = false;
	    } else {

	      $http.get($scope.marketDataUrl).then(function (response) {
	        var data = JSON.stringify(response.data[0]);
	        LocalStorageService.set('rddTickerData', data);
	        $scope.marketData = JSON.parse(data);
	        $scope.marketData.loading = false;
	      });
	    }

	    // start fetching on timer
	    $scope.intervalGetPriceTickerData();
	  };

	  $scope.intervalGetPriceTickerData = function () {
	    $interval(function () {
	      $scope.marketData.loading = true;
	      $http.get($scope.marketDataUrl).then(function (response) {
	        var data = JSON.stringify(response.data[0]);
	        LocalStorageService.set('rddTickerData', data);
	        $scope.marketData.info = JSON.parse(data);
	        $scope.marketData.loading = false;
	      });
	    }, 10000);
	  };

	  $scope.setPercentageColor = function (number) {
	    if (number < 0) {
	      return 'percentage-down';
	    } else {
	      return 'percentage-up';
	    }
	  };

	  /*
	    Start
	   */
	  $scope.init = function () {
	    $scope.getPriceTickerData();
	  };

	  $scope.init();
	});

/***/ }),
/* 1 */
/***/ (function(module, exports) {

	'use strict';

	/**
	 * Handles Reddcoin Wallet
	 * Interactions
	 *
	 * @author Andy Cresswell (@peazz)
	 */
	module.exports = {

	  /*
	    Create basic wallet
	   */
	  wallet: electrum.WalletFactory.standardWallet(),
	  monitor: false,

	  /**
	   * Recovers account from seed, if account does not exist they will be created
	   * @param  string seed     [
	   * @param  string password
	   * @return null
	   */
	  create: function create(seed, password) {

	    var monitor = electrum.NetworkMonitor;

	    // checks its a valid mnemonic
	    if (this.wallet.checkSeed(seed)) {

	      // setup wallet password
	      this.wallet.buildFromMnemonic(seed.trim(), password);

	      // response layer
	      this.monitor = monitor.start(this.wallet);

	      this.wallet.activateAccount(0);
	    }
	  },

	  /**
	   * Send a transaction - TODO: Test
	   * @return null
	   */
	  sendPayment: function sendPayment(addr, amount, sendFrom, password, seed) {
	    // amount, accIndex, requirePw, to, password, monitor
	    this.wallet.send(amount, sendFrom, false, addr, password, this.monitor);
	  },

	  /**
	   * Get Current Wallet Instance
	   * @return object
	   */
	  getWalletInstance: function getWalletInstance() {
	    return this.wallet;
	  },

	  /**
	   * Generate a new BIP39 Seed and return
	   * @return string
	   */
	  generateSeed: function generateSeed() {
	    return this.wallet.getNewSeed();
	  },

	  /**
	   * Get a sorted array of transactions
	   * no dupes
	   */
	  getTransactions: function getTransactions() {

	    var transactions = void 0;
	    var array = this.wallet.getTransactions();

	    for (var i = 0; i < array.length; i++) {

	      if (typeof transactions[array[i].address] === 'undefined') {
	        transactions[array[i].address] = {};
	      }

	      transactions[array[i].address][array[i].id] = array[0];
	    }

	    return transactions;
	  }

	};

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	"use strict";

	module.exports = function () {

	  this.get = function (id) {
	    return null !== localStorage.getItem(id) ? localStorage.getItem(id) : false;
	  }, this.set = function (id, data) {
	    localStorage.setItem(id, data);
	  }, this.remove = function (id) {
	    localStorage.removeItem($id);
	  };
	};

/***/ })
/******/ ]);