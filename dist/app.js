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
	var wallet = reddcoin.getWallet();

	// angular
	browserWallet.controller('addresses', function ($scope) {

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

	  $scope.loadWallet = function () {
	    reddcoin.create($scope.bip39seed, $scope.password); // we wont be asking for real password until required
	  };

	  $scope.generateSeed = function () {
	    $scope.bip39seed = wallet.getNewSeed();
	  };

	  $scope.formatBalance = function (addr) {
	    return bitcore.util.formatValue(angular.copy(addr.confirmed));
	  };

	  $scope.submitPayment = function (addressToSendFrom) {
	    reddcoin.sendPayment($scope.payment.sendTo, $scope.payment.amount, addressToSendFrom, $scope.payment.password);
	  };

	  /*
	    Handle Electrum Data
	   */
	  electrum.Mediator.event.on('dataReceived', function (data) {
	    // when we receive the wallet balance update lets update it
	    if (data.request.method == "blockchain.address.get_balance") {
	      $scope.addresses = wallet.getAddresses();
	      $scope.$apply();
	    }
	  });
	});

/***/ }),
/* 1 */
/***/ (function(module, exports) {

	"use strict";

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

	    // setup wallet password
	    this.wallet.buildFromMnemonic(seed.trim(), password.trim());

	    // response layer
	    this.monitor = monitor.start(this.wallet);

	    // init the wallet? need to confirm
	    this.wallet.activateAccount();
	  },

	  /**
	   * Send a transaction - TODO: Test
	   * @return null
	   */
	  sendPayment: function sendPayment(addr, amount, sendFrom, password) {

	    // amount, accIndex, requirePw, to, password, monitor
	    this.wallet.send(amount, sendFrom, false, addr, password, this.monitor);
	  },

	  /**
	   * Get Current Wallet Instance
	   * @return object
	   */
	  getWallet: function getWallet() {
	    return this.wallet;
	  },

	  /**
	   * Generate a new BIP39 Seed and return
	   * @return string
	   */
	  generateSeed: function generateSeed() {
	    return this.wallet.getNewSeed();
	  }

	};

/***/ })
/******/ ]);