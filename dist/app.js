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

	// Angular Services Register
	var localStorage = __webpack_require__(2);

	// angular directives
	__webpack_require__(3);

	// angular bootstrap
	var modal = __webpack_require__(4);

	// set wallet
	window.wallet = wallet; // access it anywhere
	browserWallet = angular.module('browserWallet', [modal, 'ngClickCopy']);
	browserWallet.service('LocalStorageService', localStorage);

	// angular
	browserWallet.controller('addresses', function ($scope, $uibModal, $timeout, $rootScope) {

	  $scope.start = {
	    bip39seed: '', //'victory pilot network forward trend cup glass grape weird license melody shy',
	    password: ''
	  };

	  // tipjar?
	  $scope.tipjar = {};

	  // holds overal account details
	  $scope.account = {
	    confirmed: 0,
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
	  $scope.loadWallet = function () {

	    var type = void 0;

	    $scope.isLoading = true;

	    if (typeof $scope.start.password === 'undefined' || $scope.start.password.length === 0) {
	      type = 'watch'; // cant send payments
	    } else {
	      type = 'encrypted'; // can send payments
	    }

	    $scope.account = type;

	    if (type == 'watch') {

	      // user wont be able to spend
	      if (confirm('You didn\'t enter a password so you wont be able to make transactions, are you sure you want to do this?')) {
	        $scope._createWallet('watch');
	      }
	    } else {
	      $scope._createWallet(type);
	    }
	  };

	  $scope._createWallet = function (type) {
	    reddcoin.create($scope.start.bip39seed, $scope.start.password, type); // we wont be asking for real password until required
	    $scope.start.password = ''; // clear the password
	  };

	  $scope.generateSeed = function () {
	    $scope.start.bip39seed = wallet.getNewSeed();
	  };

	  /*
	    Balances are returned with - attached
	    detects if minus value, makes it an abs,
	    reforms after
	   */
	  $scope.formatBalance = function (num) {

	    if (typeof num !== 'undefined') {

	      var isNegative = false;

	      if (num < 0) {
	        isNegative = true;
	        num = Math.abs(num);
	      }

	      num = bitcore.util.formatValue(angular.copy(num));

	      return isNegative ? '-' + num : num;
	    } else {

	      return 0.00;
	    }
	  };

	  /*
	    Submit Wallet Payment
	   */
	  $scope.submitPayment = function (form, addressToSendFrom) {

	    var sendError = false; // no send error
	    var validations = true; // all validations pass by default

	    $scope.isLoading = true; // were loading
	    $scope.payment.error = false; // reset any errors

	    // validate payment data
	    if (!$scope.isValidAddress($scope.payment.sendTo)) {
	      $scope.paymentForm.sendTo.$setValidity("incorrectAddress", false); // custom form error for message
	      validations = false; // failed
	    }

	    // validations pass lets go
	    if (validations) {

	      // exec
	      try {
	        reddcoin.sendPayment($scope.payment.sendTo, $scope.payment.amount, addressToSendFrom, $scope.payment.password, $scope.bip39seed, function () {
	          // blank cb, but functionality exists ;)
	        });
	      } catch (err) {
	        if (err) {
	          sendError = true;
	          $scope.payment.error = 'Unable to send payment, make sure your password is correct';
	        }
	      }

	      // payment was a success
	      if (!sendError) {
	        // force ui update
	        electrum.Mediator.event.emit('transactionAdded');
	        // reset the model and ui
	        $scope.payment = {};
	      }
	    }
	  };

	  $scope.isValidAddress = function (address) {
	    return !bitcore.Address.validate(address) ? false : true;
	  };

	  /*
	    Get Human Readable Date from
	    Unix Timestamp
	   */
	  $scope.formatTransactionDate = function (unixtime) {
	    var newDate = new Date();
	    newDate.setTime(unixtime * 1000);

	    return newDate.toUTCString();
	  };

	  $scope.getEstUsdValue = function () {
	    if (typeof $scope.account.confirmed === 'undefined' || typeof $scope.exchangeRate === 'undefined') {
	      return '0.00 USD';
	    }

	    return (bitcore.util.formatValue($scope.account.confirmed) * $scope.exchangeRate).toFixed(7) + ' USD';
	  };

	  /*
	    Checks if account is watch type
	   */
	  $scope.isAccountSpendable = function () {
	    return $scope.account.typeName === 'Unspendable' ? true : false;
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

	  $scope.openPaymentForm = function (size, parentSelector) {

	    var parentElem = parentSelector ? angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;

	    var modalInstance = $uibModal.open({
	      animation: true,
	      ariaLabelledBy: 'modal-title',
	      ariaDescribedBy: 'modal-body',
	      templateUrl: 'sendPaymentModal.html',
	      controller: 'addresses',
	      size: size
	    });
	  };

	  $scope.enableSendButton = function () {
	    return $scope.paymentForm.$valid ? false : true;
	  };

	  $scope.checkHasEnoughFunds = function () {

	    if (typeof $scope.account.confirmed === 'undefined') {
	      $scope.paymentForm.sendTo.$setValidity("notEnoughFunds", false); // custom form error for message
	      return;
	    }

	    /*
	      TODO: test more, not sure how this works with more decimel places
	     */
	    var hasFunds = $scope.payment.amount > bitcore.util.formatValue($scope.account.confirmed) ? false : true;

	    // validate payment data
	    if (!hasFunds) {
	      $scope.paymentForm.sendTo.$setValidity("notEnoughFunds", false); // custom form error for message
	    } else {
	      $scope.paymentForm.sendTo.$setValidity("notEnoughFunds", true); // custom form error for message
	    }
	  };

	  $scope.sendButtonTitle = function () {
	    if ($scope.account.type === 'watch') {
	      return 'You didn\'t provide a password when you opened your wallet so you cannot send payments.';
	    } else {
	      return 'Send Reddcoin Instantly';
	    }
	  };

	  /*
	    When a user writes, pastes or changes
	    the to address, check if its valid
	    and set invalud if not on the form
	   */
	  $scope.checkIsValidAddressOnChange = function () {
	    // validate payment data
	    if (!$scope.isValidAddress($scope.payment.sendTo)) {
	      $scope.paymentForm.sendTo.$setValidity("incorrectAddress", false); // custom form error for message
	    } else {
	      $scope.paymentForm.sendTo.$setValidity("incorrectAddress", true); // custom form error for message
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

	    $scope.depositAddress = wallet.getAddresses()[0];
	    $scope.addresses[data.address] = data;
	    $scope.showForm = false;
	    $scope.$evalAsync();
	  });

	  // wallet transaction
	  electrum.Mediator.event.on('transactionAdded', function () {
	    $scope.transactions = wallet.getTransactions();
	    $scope.account = wallet.getAccountInfo()[0];
	    $scope.tipjar = wallet.getTipJar();
	    $scope.$evalAsync();
	  });

	  electrum.Mediator.event.on('idle', function (data) {
	    $scope.isLoading = false;
	    $scope.$evalAsync();
	  });

	  // anything in from requests here
	  electrum.Mediator.event.on('dataReceived', function (data) {
	    // when we receive the wallet balance update lets update it
	    if (data.request.method == "blockchain.address.get_balance") {
	      //$scope.addresses = wallet.getAddresses();
	      //$scope.$apply();
	    }
	  });

	  // cross controller comms
	  $scope.$on('usdUpdate', function (event, data) {
	    $scope.exchangeRate = data;
	  });

	  // handles address copy event - emited from directive
	  $scope.$on('copied', function () {
	    $scope.misc.copied = true;

	    $timeout(function () {
	      $scope.misc.copied = false;
	    }, 2500);
	    $scope.$evalAsync();
	  });
	});

	/*
	  Get the latest Reddit Posts
	 */
	browserWallet.controller('redditPosts', function ($scope, $http, $interval, LocalStorageService) {

	  $scope.postsUrl = 'https://www.reddit.com/r/reddCoin/new.json?sort=new';

	  $scope.posts = {};

	  $scope.loading = true;

	  $scope.getRedditData = function () {
	    if (LocalStorageService.get('redditPosts')) {
	      $scope.posts = JSON.parse(LocalStorageService.get('redditPosts'));
	      $scope.loading = false;
	    } else {
	      $http.get($scope.postsUrl).then(function (response) {
	        var data = JSON.stringify(response.data.data.children);
	        LocalStorageService.set('redditPosts', data);
	        $scope.posts = JSON.parse(data);
	        $scope.loading = false;
	      });
	    }

	    $scope.intervalGetPriceTickerData(); // update on timer
	  };

	  $scope.intervalGetPriceTickerData = function () {
	    $interval(function () {
	      $scope.loading = true;
	      $http.get($scope.postsUrl).then(function (response) {
	        var data = JSON.stringify(response.data.data.children);
	        LocalStorageService.set('redditPosts', data);
	        $scope.posts = JSON.parse(data);
	        $scope.loading = false;
	      });
	    }, 1000000);
	  };

	  $scope.getCommentsNumber = function (num) {

	    if (num === 1) {
	      return '1 Comment';
	    } else {
	      return num + ' Comments';
	    }
	  };

	  $scope.formatDate = function (unixtime) {
	    var newDate = new Date();
	    newDate.setTime(unixtime * 1000);

	    return newDate.toUTCString();
	  };

	  $scope.getRedditData();
	});

	/*
	  Handle the ticker
	 */
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

	      $scope.$emit('usdUpdate', $scope.marketData.info.price_usd); // sends exchange rate to master controller above
	    } else {

	      $http.get($scope.marketDataUrl).then(function (response) {
	        var data = JSON.stringify(response.data[0]);
	        LocalStorageService.set('rddTickerData', data);
	        $scope.marketData = JSON.parse(data);
	        $scope.marketData.loading = false;
	        $scope.$emit('usdUpdate', $scope.marketData.info.price_usd); // sends exchange rate to master controller above
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
	        $scope.$emit('usdUpdate', $scope.marketData.info.price_usd); // sends exchange rate to master controller above
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
	  create: function create(seed, password, type) {

	    var monitor = electrum.NetworkMonitor;

	    // checks its a valid mnemonic
	    if (this.wallet.checkSeed(seed)) {

	      // setup wallet password
	      this.wallet.buildFromMnemonic(seed.trim(), password);

	      // response layer
	      this.monitor = monitor.start(this.wallet);

	      this.wallet.activateAccount(0, '', type);
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

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	'use strict';

	angular.module('ngClickCopy', []).service('ngCopy', ['$window', function ($window) {

	  var body = angular.element($window.document.body);
	  var textarea = angular.element('<textarea/>');
	  textarea.css({
	    position: 'fixed',
	    opacity: '0'
	  });

	  return function (toCopy) {
	    textarea.val(toCopy);
	    body.append(textarea);
	    textarea[0].select();

	    try {
	      var successful = document.execCommand('copy');

	      if (!successful) throw successful;
	    } catch (err) {
	      window.prompt("Copy to clipboard: Ctrl+C, Enter", toCopy);
	    }

	    textarea.remove();
	  };
	}]).directive('ngClickCopy', ['ngCopy', function (ngCopy) {
	  return {
	    restrict: 'A',
	    link: function link(scope, element, attrs) {
	      element.bind('click', function (e) {
	        ngCopy(attrs.ngClickCopy);
	        scope.$emit('copied', true);
	      });
	    }
	  };
	}]);

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(5);
	__webpack_require__(7);
	__webpack_require__(9);
	__webpack_require__(11);
	__webpack_require__(12);

	var MODULE_NAME = 'ui.bootstrap.module.modal';

	angular.module(MODULE_NAME, ['ui.bootstrap.modal', 'uib/template/modal/window.html']);

	module.exports = MODULE_NAME;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(6);

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	'use strict';

	angular.module('ui.bootstrap.multiMap', []
	/**
	 * A helper, internal data structure that stores all references attached to key
	 */
	).factory('$$multiMap', function () {
	  return {
	    createNew: function createNew() {
	      var map = {};

	      return {
	        entries: function entries() {
	          return Object.keys(map).map(function (key) {
	            return {
	              key: key,
	              value: map[key]
	            };
	          });
	        },
	        get: function get(key) {
	          return map[key];
	        },
	        hasKey: function hasKey(key) {
	          return !!map[key];
	        },
	        keys: function keys() {
	          return Object.keys(map);
	        },
	        put: function put(key, value) {
	          if (!map[key]) {
	            map[key] = [];
	          }

	          map[key].push(value);
	        },
	        remove: function remove(key, value) {
	          var values = map[key];

	          if (!values) {
	            return;
	          }

	          var idx = values.indexOf(value);

	          if (idx !== -1) {
	            values.splice(idx, 1);
	          }

	          if (!values.length) {
	            delete map[key];
	          }
	        }
	      };
	    }
	  };
	});

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(8);

	var MODULE_NAME = 'ui.bootstrap.module.position';

	angular.module(MODULE_NAME, ['ui.bootstrap.position']);

	module.exports = MODULE_NAME;

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	'use strict';

	angular.module('ui.bootstrap.position', []

	/**
	 * A set of utility methods for working with the DOM.
	 * It is meant to be used where we need to absolute-position elements in
	 * relation to another element (this is the case for tooltips, popovers,
	 * typeahead suggestions etc.).
	 */
	).factory('$uibPosition', ['$document', '$window', function ($document, $window) {
	  /**
	   * Used by scrollbarWidth() function to cache scrollbar's width.
	   * Do not access this variable directly, use scrollbarWidth() instead.
	   */
	  var SCROLLBAR_WIDTH;
	  /**
	   * scrollbar on body and html element in IE and Edge overlay
	   * content and should be considered 0 width.
	   */
	  var BODY_SCROLLBAR_WIDTH;
	  var OVERFLOW_REGEX = {
	    normal: /(auto|scroll)/,
	    hidden: /(auto|scroll|hidden)/
	  };
	  var PLACEMENT_REGEX = {
	    auto: /\s?auto?\s?/i,
	    primary: /^(top|bottom|left|right)$/,
	    secondary: /^(top|bottom|left|right|center)$/,
	    vertical: /^(top|bottom)$/
	  };
	  var BODY_REGEX = /(HTML|BODY)/;

	  return {

	    /**
	     * Provides a raw DOM element from a jQuery/jQLite element.
	     *
	     * @param {element} elem - The element to convert.
	     *
	     * @returns {element} A HTML element.
	     */
	    getRawNode: function getRawNode(elem) {
	      return elem.nodeName ? elem : elem[0] || elem;
	    },

	    /**
	     * Provides a parsed number for a style property.  Strips
	     * units and casts invalid numbers to 0.
	     *
	     * @param {string} value - The style value to parse.
	     *
	     * @returns {number} A valid number.
	     */
	    parseStyle: function parseStyle(value) {
	      value = parseFloat(value);
	      return isFinite(value) ? value : 0;
	    },

	    /**
	     * Provides the closest positioned ancestor.
	     *
	     * @param {element} element - The element to get the offest parent for.
	     *
	     * @returns {element} The closest positioned ancestor.
	     */
	    offsetParent: function offsetParent(elem) {
	      elem = this.getRawNode(elem);

	      var offsetParent = elem.offsetParent || $document[0].documentElement;

	      function isStaticPositioned(el) {
	        return ($window.getComputedStyle(el).position || 'static') === 'static';
	      }

	      while (offsetParent && offsetParent !== $document[0].documentElement && isStaticPositioned(offsetParent)) {
	        offsetParent = offsetParent.offsetParent;
	      }

	      return offsetParent || $document[0].documentElement;
	    },

	    /**
	     * Provides the scrollbar width, concept from TWBS measureScrollbar()
	     * function in https://github.com/twbs/bootstrap/blob/master/js/modal.js
	     * In IE and Edge, scollbar on body and html element overlay and should
	     * return a width of 0.
	     *
	     * @returns {number} The width of the browser scollbar.
	     */
	    scrollbarWidth: function scrollbarWidth(isBody) {
	      if (isBody) {
	        if (angular.isUndefined(BODY_SCROLLBAR_WIDTH)) {
	          var bodyElem = $document.find('body');
	          bodyElem.addClass('uib-position-body-scrollbar-measure');
	          BODY_SCROLLBAR_WIDTH = $window.innerWidth - bodyElem[0].clientWidth;
	          BODY_SCROLLBAR_WIDTH = isFinite(BODY_SCROLLBAR_WIDTH) ? BODY_SCROLLBAR_WIDTH : 0;
	          bodyElem.removeClass('uib-position-body-scrollbar-measure');
	        }
	        return BODY_SCROLLBAR_WIDTH;
	      }

	      if (angular.isUndefined(SCROLLBAR_WIDTH)) {
	        var scrollElem = angular.element('<div class="uib-position-scrollbar-measure"></div>');
	        $document.find('body').append(scrollElem);
	        SCROLLBAR_WIDTH = scrollElem[0].offsetWidth - scrollElem[0].clientWidth;
	        SCROLLBAR_WIDTH = isFinite(SCROLLBAR_WIDTH) ? SCROLLBAR_WIDTH : 0;
	        scrollElem.remove();
	      }

	      return SCROLLBAR_WIDTH;
	    },

	    /**
	     * Provides the padding required on an element to replace the scrollbar.
	     *
	     * @returns {object} An object with the following properties:
	     *   <ul>
	     *     <li>**scrollbarWidth**: the width of the scrollbar</li>
	     *     <li>**widthOverflow**: whether the the width is overflowing</li>
	     *     <li>**right**: the amount of right padding on the element needed to replace the scrollbar</li>
	     *     <li>**rightOriginal**: the amount of right padding currently on the element</li>
	     *     <li>**heightOverflow**: whether the the height is overflowing</li>
	     *     <li>**bottom**: the amount of bottom padding on the element needed to replace the scrollbar</li>
	     *     <li>**bottomOriginal**: the amount of bottom padding currently on the element</li>
	     *   </ul>
	     */
	    scrollbarPadding: function scrollbarPadding(elem) {
	      elem = this.getRawNode(elem);

	      var elemStyle = $window.getComputedStyle(elem);
	      var paddingRight = this.parseStyle(elemStyle.paddingRight);
	      var paddingBottom = this.parseStyle(elemStyle.paddingBottom);
	      var scrollParent = this.scrollParent(elem, false, true);
	      var scrollbarWidth = this.scrollbarWidth(BODY_REGEX.test(scrollParent.tagName));

	      return {
	        scrollbarWidth: scrollbarWidth,
	        widthOverflow: scrollParent.scrollWidth > scrollParent.clientWidth,
	        right: paddingRight + scrollbarWidth,
	        originalRight: paddingRight,
	        heightOverflow: scrollParent.scrollHeight > scrollParent.clientHeight,
	        bottom: paddingBottom + scrollbarWidth,
	        originalBottom: paddingBottom
	      };
	    },

	    /**
	     * Checks to see if the element is scrollable.
	     *
	     * @param {element} elem - The element to check.
	     * @param {boolean=} [includeHidden=false] - Should scroll style of 'hidden' be considered,
	     *   default is false.
	     *
	     * @returns {boolean} Whether the element is scrollable.
	     */
	    isScrollable: function isScrollable(elem, includeHidden) {
	      elem = this.getRawNode(elem);

	      var overflowRegex = includeHidden ? OVERFLOW_REGEX.hidden : OVERFLOW_REGEX.normal;
	      var elemStyle = $window.getComputedStyle(elem);
	      return overflowRegex.test(elemStyle.overflow + elemStyle.overflowY + elemStyle.overflowX);
	    },

	    /**
	     * Provides the closest scrollable ancestor.
	     * A port of the jQuery UI scrollParent method:
	     * https://github.com/jquery/jquery-ui/blob/master/ui/scroll-parent.js
	     *
	     * @param {element} elem - The element to find the scroll parent of.
	     * @param {boolean=} [includeHidden=false] - Should scroll style of 'hidden' be considered,
	     *   default is false.
	     * @param {boolean=} [includeSelf=false] - Should the element being passed be
	     * included in the scrollable llokup.
	     *
	     * @returns {element} A HTML element.
	     */
	    scrollParent: function scrollParent(elem, includeHidden, includeSelf) {
	      elem = this.getRawNode(elem);

	      var overflowRegex = includeHidden ? OVERFLOW_REGEX.hidden : OVERFLOW_REGEX.normal;
	      var documentEl = $document[0].documentElement;
	      var elemStyle = $window.getComputedStyle(elem);
	      if (includeSelf && overflowRegex.test(elemStyle.overflow + elemStyle.overflowY + elemStyle.overflowX)) {
	        return elem;
	      }
	      var excludeStatic = elemStyle.position === 'absolute';
	      var scrollParent = elem.parentElement || documentEl;

	      if (scrollParent === documentEl || elemStyle.position === 'fixed') {
	        return documentEl;
	      }

	      while (scrollParent.parentElement && scrollParent !== documentEl) {
	        var spStyle = $window.getComputedStyle(scrollParent);
	        if (excludeStatic && spStyle.position !== 'static') {
	          excludeStatic = false;
	        }

	        if (!excludeStatic && overflowRegex.test(spStyle.overflow + spStyle.overflowY + spStyle.overflowX)) {
	          break;
	        }
	        scrollParent = scrollParent.parentElement;
	      }

	      return scrollParent;
	    },

	    /**
	     * Provides read-only equivalent of jQuery's position function:
	     * http://api.jquery.com/position/ - distance to closest positioned
	     * ancestor.  Does not account for margins by default like jQuery position.
	     *
	     * @param {element} elem - The element to caclulate the position on.
	     * @param {boolean=} [includeMargins=false] - Should margins be accounted
	     * for, default is false.
	     *
	     * @returns {object} An object with the following properties:
	     *   <ul>
	     *     <li>**width**: the width of the element</li>
	     *     <li>**height**: the height of the element</li>
	     *     <li>**top**: distance to top edge of offset parent</li>
	     *     <li>**left**: distance to left edge of offset parent</li>
	     *   </ul>
	     */
	    position: function position(elem, includeMagins) {
	      elem = this.getRawNode(elem);

	      var elemOffset = this.offset(elem);
	      if (includeMagins) {
	        var elemStyle = $window.getComputedStyle(elem);
	        elemOffset.top -= this.parseStyle(elemStyle.marginTop);
	        elemOffset.left -= this.parseStyle(elemStyle.marginLeft);
	      }
	      var parent = this.offsetParent(elem);
	      var parentOffset = { top: 0, left: 0 };

	      if (parent !== $document[0].documentElement) {
	        parentOffset = this.offset(parent);
	        parentOffset.top += parent.clientTop - parent.scrollTop;
	        parentOffset.left += parent.clientLeft - parent.scrollLeft;
	      }

	      return {
	        width: Math.round(angular.isNumber(elemOffset.width) ? elemOffset.width : elem.offsetWidth),
	        height: Math.round(angular.isNumber(elemOffset.height) ? elemOffset.height : elem.offsetHeight),
	        top: Math.round(elemOffset.top - parentOffset.top),
	        left: Math.round(elemOffset.left - parentOffset.left)
	      };
	    },

	    /**
	     * Provides read-only equivalent of jQuery's offset function:
	     * http://api.jquery.com/offset/ - distance to viewport.  Does
	     * not account for borders, margins, or padding on the body
	     * element.
	     *
	     * @param {element} elem - The element to calculate the offset on.
	     *
	     * @returns {object} An object with the following properties:
	     *   <ul>
	     *     <li>**width**: the width of the element</li>
	     *     <li>**height**: the height of the element</li>
	     *     <li>**top**: distance to top edge of viewport</li>
	     *     <li>**right**: distance to bottom edge of viewport</li>
	     *   </ul>
	     */
	    offset: function offset(elem) {
	      elem = this.getRawNode(elem);

	      var elemBCR = elem.getBoundingClientRect();
	      return {
	        width: Math.round(angular.isNumber(elemBCR.width) ? elemBCR.width : elem.offsetWidth),
	        height: Math.round(angular.isNumber(elemBCR.height) ? elemBCR.height : elem.offsetHeight),
	        top: Math.round(elemBCR.top + ($window.pageYOffset || $document[0].documentElement.scrollTop)),
	        left: Math.round(elemBCR.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft))
	      };
	    },

	    /**
	     * Provides offset distance to the closest scrollable ancestor
	     * or viewport.  Accounts for border and scrollbar width.
	     *
	     * Right and bottom dimensions represent the distance to the
	     * respective edge of the viewport element.  If the element
	     * edge extends beyond the viewport, a negative value will be
	     * reported.
	     *
	     * @param {element} elem - The element to get the viewport offset for.
	     * @param {boolean=} [useDocument=false] - Should the viewport be the document element instead
	     * of the first scrollable element, default is false.
	     * @param {boolean=} [includePadding=true] - Should the padding on the offset parent element
	     * be accounted for, default is true.
	     *
	     * @returns {object} An object with the following properties:
	     *   <ul>
	     *     <li>**top**: distance to the top content edge of viewport element</li>
	     *     <li>**bottom**: distance to the bottom content edge of viewport element</li>
	     *     <li>**left**: distance to the left content edge of viewport element</li>
	     *     <li>**right**: distance to the right content edge of viewport element</li>
	     *   </ul>
	     */
	    viewportOffset: function viewportOffset(elem, useDocument, includePadding) {
	      elem = this.getRawNode(elem);
	      includePadding = includePadding !== false ? true : false;

	      var elemBCR = elem.getBoundingClientRect();
	      var offsetBCR = { top: 0, left: 0, bottom: 0, right: 0 };

	      var offsetParent = useDocument ? $document[0].documentElement : this.scrollParent(elem);
	      var offsetParentBCR = offsetParent.getBoundingClientRect();

	      offsetBCR.top = offsetParentBCR.top + offsetParent.clientTop;
	      offsetBCR.left = offsetParentBCR.left + offsetParent.clientLeft;
	      if (offsetParent === $document[0].documentElement) {
	        offsetBCR.top += $window.pageYOffset;
	        offsetBCR.left += $window.pageXOffset;
	      }
	      offsetBCR.bottom = offsetBCR.top + offsetParent.clientHeight;
	      offsetBCR.right = offsetBCR.left + offsetParent.clientWidth;

	      if (includePadding) {
	        var offsetParentStyle = $window.getComputedStyle(offsetParent);
	        offsetBCR.top += this.parseStyle(offsetParentStyle.paddingTop);
	        offsetBCR.bottom -= this.parseStyle(offsetParentStyle.paddingBottom);
	        offsetBCR.left += this.parseStyle(offsetParentStyle.paddingLeft);
	        offsetBCR.right -= this.parseStyle(offsetParentStyle.paddingRight);
	      }

	      return {
	        top: Math.round(elemBCR.top - offsetBCR.top),
	        bottom: Math.round(offsetBCR.bottom - elemBCR.bottom),
	        left: Math.round(elemBCR.left - offsetBCR.left),
	        right: Math.round(offsetBCR.right - elemBCR.right)
	      };
	    },

	    /**
	     * Provides an array of placement values parsed from a placement string.
	     * Along with the 'auto' indicator, supported placement strings are:
	     *   <ul>
	     *     <li>top: element on top, horizontally centered on host element.</li>
	     *     <li>top-left: element on top, left edge aligned with host element left edge.</li>
	     *     <li>top-right: element on top, lerightft edge aligned with host element right edge.</li>
	     *     <li>bottom: element on bottom, horizontally centered on host element.</li>
	     *     <li>bottom-left: element on bottom, left edge aligned with host element left edge.</li>
	     *     <li>bottom-right: element on bottom, right edge aligned with host element right edge.</li>
	     *     <li>left: element on left, vertically centered on host element.</li>
	     *     <li>left-top: element on left, top edge aligned with host element top edge.</li>
	     *     <li>left-bottom: element on left, bottom edge aligned with host element bottom edge.</li>
	     *     <li>right: element on right, vertically centered on host element.</li>
	     *     <li>right-top: element on right, top edge aligned with host element top edge.</li>
	     *     <li>right-bottom: element on right, bottom edge aligned with host element bottom edge.</li>
	     *   </ul>
	     * A placement string with an 'auto' indicator is expected to be
	     * space separated from the placement, i.e: 'auto bottom-left'  If
	     * the primary and secondary placement values do not match 'top,
	     * bottom, left, right' then 'top' will be the primary placement and
	     * 'center' will be the secondary placement.  If 'auto' is passed, true
	     * will be returned as the 3rd value of the array.
	     *
	     * @param {string} placement - The placement string to parse.
	     *
	     * @returns {array} An array with the following values
	     * <ul>
	     *   <li>**[0]**: The primary placement.</li>
	     *   <li>**[1]**: The secondary placement.</li>
	     *   <li>**[2]**: If auto is passed: true, else undefined.</li>
	     * </ul>
	     */
	    parsePlacement: function parsePlacement(placement) {
	      var autoPlace = PLACEMENT_REGEX.auto.test(placement);
	      if (autoPlace) {
	        placement = placement.replace(PLACEMENT_REGEX.auto, '');
	      }

	      placement = placement.split('-');

	      placement[0] = placement[0] || 'top';
	      if (!PLACEMENT_REGEX.primary.test(placement[0])) {
	        placement[0] = 'top';
	      }

	      placement[1] = placement[1] || 'center';
	      if (!PLACEMENT_REGEX.secondary.test(placement[1])) {
	        placement[1] = 'center';
	      }

	      if (autoPlace) {
	        placement[2] = true;
	      } else {
	        placement[2] = false;
	      }

	      return placement;
	    },

	    /**
	     * Provides coordinates for an element to be positioned relative to
	     * another element.  Passing 'auto' as part of the placement parameter
	     * will enable smart placement - where the element fits. i.e:
	     * 'auto left-top' will check to see if there is enough space to the left
	     * of the hostElem to fit the targetElem, if not place right (same for secondary
	     * top placement).  Available space is calculated using the viewportOffset
	     * function.
	     *
	     * @param {element} hostElem - The element to position against.
	     * @param {element} targetElem - The element to position.
	     * @param {string=} [placement=top] - The placement for the targetElem,
	     *   default is 'top'. 'center' is assumed as secondary placement for
	     *   'top', 'left', 'right', and 'bottom' placements.  Available placements are:
	     *   <ul>
	     *     <li>top</li>
	     *     <li>top-right</li>
	     *     <li>top-left</li>
	     *     <li>bottom</li>
	     *     <li>bottom-left</li>
	     *     <li>bottom-right</li>
	     *     <li>left</li>
	     *     <li>left-top</li>
	     *     <li>left-bottom</li>
	     *     <li>right</li>
	     *     <li>right-top</li>
	     *     <li>right-bottom</li>
	     *   </ul>
	     * @param {boolean=} [appendToBody=false] - Should the top and left values returned
	     *   be calculated from the body element, default is false.
	     *
	     * @returns {object} An object with the following properties:
	     *   <ul>
	     *     <li>**top**: Value for targetElem top.</li>
	     *     <li>**left**: Value for targetElem left.</li>
	     *     <li>**placement**: The resolved placement.</li>
	     *   </ul>
	     */
	    positionElements: function positionElements(hostElem, targetElem, placement, appendToBody) {
	      hostElem = this.getRawNode(hostElem);
	      targetElem = this.getRawNode(targetElem);

	      // need to read from prop to support tests.
	      var targetWidth = angular.isDefined(targetElem.offsetWidth) ? targetElem.offsetWidth : targetElem.prop('offsetWidth');
	      var targetHeight = angular.isDefined(targetElem.offsetHeight) ? targetElem.offsetHeight : targetElem.prop('offsetHeight');

	      placement = this.parsePlacement(placement);

	      var hostElemPos = appendToBody ? this.offset(hostElem) : this.position(hostElem);
	      var targetElemPos = { top: 0, left: 0, placement: '' };

	      if (placement[2]) {
	        var viewportOffset = this.viewportOffset(hostElem, appendToBody);

	        var targetElemStyle = $window.getComputedStyle(targetElem);
	        var adjustedSize = {
	          width: targetWidth + Math.round(Math.abs(this.parseStyle(targetElemStyle.marginLeft) + this.parseStyle(targetElemStyle.marginRight))),
	          height: targetHeight + Math.round(Math.abs(this.parseStyle(targetElemStyle.marginTop) + this.parseStyle(targetElemStyle.marginBottom)))
	        };

	        placement[0] = placement[0] === 'top' && adjustedSize.height > viewportOffset.top && adjustedSize.height <= viewportOffset.bottom ? 'bottom' : placement[0] === 'bottom' && adjustedSize.height > viewportOffset.bottom && adjustedSize.height <= viewportOffset.top ? 'top' : placement[0] === 'left' && adjustedSize.width > viewportOffset.left && adjustedSize.width <= viewportOffset.right ? 'right' : placement[0] === 'right' && adjustedSize.width > viewportOffset.right && adjustedSize.width <= viewportOffset.left ? 'left' : placement[0];

	        placement[1] = placement[1] === 'top' && adjustedSize.height - hostElemPos.height > viewportOffset.bottom && adjustedSize.height - hostElemPos.height <= viewportOffset.top ? 'bottom' : placement[1] === 'bottom' && adjustedSize.height - hostElemPos.height > viewportOffset.top && adjustedSize.height - hostElemPos.height <= viewportOffset.bottom ? 'top' : placement[1] === 'left' && adjustedSize.width - hostElemPos.width > viewportOffset.right && adjustedSize.width - hostElemPos.width <= viewportOffset.left ? 'right' : placement[1] === 'right' && adjustedSize.width - hostElemPos.width > viewportOffset.left && adjustedSize.width - hostElemPos.width <= viewportOffset.right ? 'left' : placement[1];

	        if (placement[1] === 'center') {
	          if (PLACEMENT_REGEX.vertical.test(placement[0])) {
	            var xOverflow = hostElemPos.width / 2 - targetWidth / 2;
	            if (viewportOffset.left + xOverflow < 0 && adjustedSize.width - hostElemPos.width <= viewportOffset.right) {
	              placement[1] = 'left';
	            } else if (viewportOffset.right + xOverflow < 0 && adjustedSize.width - hostElemPos.width <= viewportOffset.left) {
	              placement[1] = 'right';
	            }
	          } else {
	            var yOverflow = hostElemPos.height / 2 - adjustedSize.height / 2;
	            if (viewportOffset.top + yOverflow < 0 && adjustedSize.height - hostElemPos.height <= viewportOffset.bottom) {
	              placement[1] = 'top';
	            } else if (viewportOffset.bottom + yOverflow < 0 && adjustedSize.height - hostElemPos.height <= viewportOffset.top) {
	              placement[1] = 'bottom';
	            }
	          }
	        }
	      }

	      switch (placement[0]) {
	        case 'top':
	          targetElemPos.top = hostElemPos.top - targetHeight;
	          break;
	        case 'bottom':
	          targetElemPos.top = hostElemPos.top + hostElemPos.height;
	          break;
	        case 'left':
	          targetElemPos.left = hostElemPos.left - targetWidth;
	          break;
	        case 'right':
	          targetElemPos.left = hostElemPos.left + hostElemPos.width;
	          break;
	      }

	      switch (placement[1]) {
	        case 'top':
	          targetElemPos.top = hostElemPos.top;
	          break;
	        case 'bottom':
	          targetElemPos.top = hostElemPos.top + hostElemPos.height - targetHeight;
	          break;
	        case 'left':
	          targetElemPos.left = hostElemPos.left;
	          break;
	        case 'right':
	          targetElemPos.left = hostElemPos.left + hostElemPos.width - targetWidth;
	          break;
	        case 'center':
	          if (PLACEMENT_REGEX.vertical.test(placement[0])) {
	            targetElemPos.left = hostElemPos.left + hostElemPos.width / 2 - targetWidth / 2;
	          } else {
	            targetElemPos.top = hostElemPos.top + hostElemPos.height / 2 - targetHeight / 2;
	          }
	          break;
	      }

	      targetElemPos.top = Math.round(targetElemPos.top);
	      targetElemPos.left = Math.round(targetElemPos.left);
	      targetElemPos.placement = placement[1] === 'center' ? placement[0] : placement[0] + '-' + placement[1];

	      return targetElemPos;
	    },

	    /**
	     * Provides a way to adjust the top positioning after first
	     * render to correctly align element to top after content
	     * rendering causes resized element height
	     *
	     * @param {array} placementClasses - The array of strings of classes
	     * element should have.
	     * @param {object} containerPosition - The object with container
	     * position information
	     * @param {number} initialHeight - The initial height for the elem.
	     * @param {number} currentHeight - The current height for the elem.
	     */
	    adjustTop: function adjustTop(placementClasses, containerPosition, initialHeight, currentHeight) {
	      if (placementClasses.indexOf('top') !== -1 && initialHeight !== currentHeight) {
	        return {
	          top: containerPosition.top - currentHeight + 'px'
	        };
	      }
	    },

	    /**
	     * Provides a way for positioning tooltip & dropdown
	     * arrows when using placement options beyond the standard
	     * left, right, top, or bottom.
	     *
	     * @param {element} elem - The tooltip/dropdown element.
	     * @param {string} placement - The placement for the elem.
	     */
	    positionArrow: function positionArrow(elem, placement) {
	      elem = this.getRawNode(elem);

	      var innerElem = elem.querySelector('.tooltip-inner, .popover-inner');
	      if (!innerElem) {
	        return;
	      }

	      var isTooltip = angular.element(innerElem).hasClass('tooltip-inner');

	      var arrowElem = isTooltip ? elem.querySelector('.tooltip-arrow') : elem.querySelector('.arrow');
	      if (!arrowElem) {
	        return;
	      }

	      var arrowCss = {
	        top: '',
	        bottom: '',
	        left: '',
	        right: ''
	      };

	      placement = this.parsePlacement(placement);
	      if (placement[1] === 'center') {
	        // no adjustment necessary - just reset styles
	        angular.element(arrowElem).css(arrowCss);
	        return;
	      }

	      var borderProp = 'border-' + placement[0] + '-width';
	      var borderWidth = $window.getComputedStyle(arrowElem)[borderProp];

	      var borderRadiusProp = 'border-';
	      if (PLACEMENT_REGEX.vertical.test(placement[0])) {
	        borderRadiusProp += placement[0] + '-' + placement[1];
	      } else {
	        borderRadiusProp += placement[1] + '-' + placement[0];
	      }
	      borderRadiusProp += '-radius';
	      var borderRadius = $window.getComputedStyle(isTooltip ? innerElem : elem)[borderRadiusProp];

	      switch (placement[0]) {
	        case 'top':
	          arrowCss.bottom = isTooltip ? '0' : '-' + borderWidth;
	          break;
	        case 'bottom':
	          arrowCss.top = isTooltip ? '0' : '-' + borderWidth;
	          break;
	        case 'left':
	          arrowCss.right = isTooltip ? '0' : '-' + borderWidth;
	          break;
	        case 'right':
	          arrowCss.left = isTooltip ? '0' : '-' + borderWidth;
	          break;
	      }

	      arrowCss[placement[1]] = borderRadius;

	      angular.element(arrowElem).css(arrowCss);
	    }
	  };
	}]);

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(10);

	var MODULE_NAME = 'ui.bootstrap.module.stackedMap';

	angular.module(MODULE_NAME, ['ui.bootstrap.stackedMap']);

	module.exports = MODULE_NAME;

/***/ }),
/* 10 */
/***/ (function(module, exports) {

	'use strict';

	angular.module('ui.bootstrap.stackedMap', []
	/**
	 * A helper, internal data structure that acts as a map but also allows getting / removing
	 * elements in the LIFO order
	 */
	).factory('$$stackedMap', function () {
	  return {
	    createNew: function createNew() {
	      var stack = [];

	      return {
	        add: function add(key, value) {
	          stack.push({
	            key: key,
	            value: value
	          });
	        },
	        get: function get(key) {
	          for (var i = 0; i < stack.length; i++) {
	            if (key === stack[i].key) {
	              return stack[i];
	            }
	          }
	        },
	        keys: function keys() {
	          var keys = [];
	          for (var i = 0; i < stack.length; i++) {
	            keys.push(stack[i].key);
	          }
	          return keys;
	        },
	        top: function top() {
	          return stack[stack.length - 1];
	        },
	        remove: function remove(key) {
	          var idx = -1;
	          for (var i = 0; i < stack.length; i++) {
	            if (key === stack[i].key) {
	              idx = i;
	              break;
	            }
	          }
	          return stack.splice(idx, 1)[0];
	        },
	        removeTop: function removeTop() {
	          return stack.pop();
	        },
	        length: function length() {
	          return stack.length;
	        }
	      };
	    }
	  };
	});

/***/ }),
/* 11 */
/***/ (function(module, exports) {

	"use strict";

	angular.module("uib/template/modal/window.html", []).run(["$templateCache", function ($templateCache) {
	  $templateCache.put("uib/template/modal/window.html", "<div class=\"modal-dialog {{size ? 'modal-' + size : ''}}\"><div class=\"modal-content\" uib-modal-transclude></div></div>\n" + "");
	}]);

/***/ }),
/* 12 */
/***/ (function(module, exports) {

	'use strict';

	angular.module('ui.bootstrap.modal', ['ui.bootstrap.multiMap', 'ui.bootstrap.stackedMap', 'ui.bootstrap.position']
	/**
	 * Pluggable resolve mechanism for the modal resolve resolution
	 * Supports UI Router's $resolve service
	 */
	).provider('$uibResolve', function () {
	  var resolve = this;
	  this.resolver = null;

	  this.setResolver = function (resolver) {
	    this.resolver = resolver;
	  };

	  this.$get = ['$injector', '$q', function ($injector, $q) {
	    var resolver = resolve.resolver ? $injector.get(resolve.resolver) : null;
	    return {
	      resolve: function resolve(invocables, locals, parent, self) {
	        if (resolver) {
	          return resolver.resolve(invocables, locals, parent, self);
	        }

	        var promises = [];

	        angular.forEach(invocables, function (value) {
	          if (angular.isFunction(value) || angular.isArray(value)) {
	            promises.push($q.resolve($injector.invoke(value)));
	          } else if (angular.isString(value)) {
	            promises.push($q.resolve($injector.get(value)));
	          } else {
	            promises.push($q.resolve(value));
	          }
	        });

	        return $q.all(promises).then(function (resolves) {
	          var resolveObj = {};
	          var resolveIter = 0;
	          angular.forEach(invocables, function (value, key) {
	            resolveObj[key] = resolves[resolveIter++];
	          });

	          return resolveObj;
	        });
	      }
	    };
	  }];
	}

	/**
	 * A helper directive for the $modal service. It creates a backdrop element.
	 */
	).directive('uibModalBackdrop', ['$animate', '$injector', '$uibModalStack', function ($animate, $injector, $modalStack) {
	  return {
	    restrict: 'A',
	    compile: function compile(tElement, tAttrs) {
	      tElement.addClass(tAttrs.backdropClass);
	      return linkFn;
	    }
	  };

	  function linkFn(scope, element, attrs) {
	    if (attrs.modalInClass) {
	      $animate.addClass(element, attrs.modalInClass);

	      scope.$on($modalStack.NOW_CLOSING_EVENT, function (e, setIsAsync) {
	        var done = setIsAsync();
	        if (scope.modalOptions.animation) {
	          $animate.removeClass(element, attrs.modalInClass).then(done);
	        } else {
	          done();
	        }
	      });
	    }
	  }
	}]).directive('uibModalWindow', ['$uibModalStack', '$q', '$animateCss', '$document', function ($modalStack, $q, $animateCss, $document) {
	  return {
	    scope: {
	      index: '@'
	    },
	    restrict: 'A',
	    transclude: true,
	    templateUrl: function templateUrl(tElement, tAttrs) {
	      return tAttrs.templateUrl || 'uib/template/modal/window.html';
	    },
	    link: function link(scope, element, attrs) {
	      element.addClass(attrs.windowTopClass || '');
	      scope.size = attrs.size;

	      scope.close = function (evt) {
	        var modal = $modalStack.getTop();
	        if (modal && modal.value.backdrop && modal.value.backdrop !== 'static' && evt.target === evt.currentTarget) {
	          evt.preventDefault();
	          evt.stopPropagation();
	          $modalStack.dismiss(modal.key, 'backdrop click');
	        }
	      };

	      // moved from template to fix issue #2280
	      element.on('click', scope.close);

	      // This property is only added to the scope for the purpose of detecting when this directive is rendered.
	      // We can detect that by using this property in the template associated with this directive and then use
	      // {@link Attribute#$observe} on it. For more details please see {@link TableColumnResize}.
	      scope.$isRendered = true;

	      // Deferred object that will be resolved when this modal is rendered.
	      var modalRenderDeferObj = $q.defer();
	      // Resolve render promise post-digest
	      scope.$$postDigest(function () {
	        modalRenderDeferObj.resolve();
	      });

	      modalRenderDeferObj.promise.then(function () {
	        var animationPromise = null;

	        if (attrs.modalInClass) {
	          animationPromise = $animateCss(element, {
	            addClass: attrs.modalInClass
	          }).start();

	          scope.$on($modalStack.NOW_CLOSING_EVENT, function (e, setIsAsync) {
	            var done = setIsAsync();
	            $animateCss(element, {
	              removeClass: attrs.modalInClass
	            }).start().then(done);
	          });
	        }

	        $q.when(animationPromise).then(function () {
	          // Notify {@link $modalStack} that modal is rendered.
	          var modal = $modalStack.getTop();
	          if (modal) {
	            $modalStack.modalRendered(modal.key);
	          }

	          /**
	           * If something within the freshly-opened modal already has focus (perhaps via a
	           * directive that causes focus) then there's no need to try to focus anything.
	           */
	          if (!($document[0].activeElement && element[0].contains($document[0].activeElement))) {
	            var inputWithAutofocus = element[0].querySelector('[autofocus]');
	            /**
	             * Auto-focusing of a freshly-opened modal element causes any child elements
	             * with the autofocus attribute to lose focus. This is an issue on touch
	             * based devices which will show and then hide the onscreen keyboard.
	             * Attempts to refocus the autofocus element via JavaScript will not reopen
	             * the onscreen keyboard. Fixed by updated the focusing logic to only autofocus
	             * the modal element if the modal does not contain an autofocus element.
	             */
	            if (inputWithAutofocus) {
	              inputWithAutofocus.focus();
	            } else {
	              element[0].focus();
	            }
	          }
	        });
	      });
	    }
	  };
	}]).directive('uibModalAnimationClass', function () {
	  return {
	    compile: function compile(tElement, tAttrs) {
	      if (tAttrs.modalAnimation) {
	        tElement.addClass(tAttrs.uibModalAnimationClass);
	      }
	    }
	  };
	}).directive('uibModalTransclude', ['$animate', function ($animate) {
	  return {
	    link: function link(scope, element, attrs, controller, transclude) {
	      transclude(scope.$parent, function (clone) {
	        element.empty();
	        $animate.enter(clone, element);
	      });
	    }
	  };
	}]).factory('$uibModalStack', ['$animate', '$animateCss', '$document', '$compile', '$rootScope', '$q', '$$multiMap', '$$stackedMap', '$uibPosition', function ($animate, $animateCss, $document, $compile, $rootScope, $q, $$multiMap, $$stackedMap, $uibPosition) {
	  var OPENED_MODAL_CLASS = 'modal-open';

	  var backdropDomEl, backdropScope;
	  var openedWindows = $$stackedMap.createNew();
	  var openedClasses = $$multiMap.createNew();
	  var $modalStack = {
	    NOW_CLOSING_EVENT: 'modal.stack.now-closing'
	  };
	  var topModalIndex = 0;
	  var previousTopOpenedModal = null;
	  var ARIA_HIDDEN_ATTRIBUTE_NAME = 'data-bootstrap-modal-aria-hidden-count';

	  //Modal focus behavior
	  var tabbableSelector = 'a[href], area[href], input:not([disabled]):not([tabindex=\'-1\']), ' + 'button:not([disabled]):not([tabindex=\'-1\']),select:not([disabled]):not([tabindex=\'-1\']), textarea:not([disabled]):not([tabindex=\'-1\']), ' + 'iframe, object, embed, *[tabindex]:not([tabindex=\'-1\']), *[contenteditable=true]';
	  var scrollbarPadding;
	  var SNAKE_CASE_REGEXP = /[A-Z]/g;

	  // TODO: extract into common dependency with tooltip
	  function snake_case(name) {
	    var separator = '-';
	    return name.replace(SNAKE_CASE_REGEXP, function (letter, pos) {
	      return (pos ? separator : '') + letter.toLowerCase();
	    });
	  }

	  function isVisible(element) {
	    return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
	  }

	  function backdropIndex() {
	    var topBackdropIndex = -1;
	    var opened = openedWindows.keys();
	    for (var i = 0; i < opened.length; i++) {
	      if (openedWindows.get(opened[i]).value.backdrop) {
	        topBackdropIndex = i;
	      }
	    }

	    // If any backdrop exist, ensure that it's index is always
	    // right below the top modal
	    if (topBackdropIndex > -1 && topBackdropIndex < topModalIndex) {
	      topBackdropIndex = topModalIndex;
	    }
	    return topBackdropIndex;
	  }

	  $rootScope.$watch(backdropIndex, function (newBackdropIndex) {
	    if (backdropScope) {
	      backdropScope.index = newBackdropIndex;
	    }
	  });

	  function removeModalWindow(modalInstance, elementToReceiveFocus) {
	    var modalWindow = openedWindows.get(modalInstance).value;
	    var appendToElement = modalWindow.appendTo;

	    //clean up the stack
	    openedWindows.remove(modalInstance);
	    previousTopOpenedModal = openedWindows.top();
	    if (previousTopOpenedModal) {
	      topModalIndex = parseInt(previousTopOpenedModal.value.modalDomEl.attr('index'), 10);
	    }

	    removeAfterAnimate(modalWindow.modalDomEl, modalWindow.modalScope, function () {
	      var modalBodyClass = modalWindow.openedClass || OPENED_MODAL_CLASS;
	      openedClasses.remove(modalBodyClass, modalInstance);
	      var areAnyOpen = openedClasses.hasKey(modalBodyClass);
	      appendToElement.toggleClass(modalBodyClass, areAnyOpen);
	      if (!areAnyOpen && scrollbarPadding && scrollbarPadding.heightOverflow && scrollbarPadding.scrollbarWidth) {
	        if (scrollbarPadding.originalRight) {
	          appendToElement.css({ paddingRight: scrollbarPadding.originalRight + 'px' });
	        } else {
	          appendToElement.css({ paddingRight: '' });
	        }
	        scrollbarPadding = null;
	      }
	      toggleTopWindowClass(true);
	    }, modalWindow.closedDeferred);
	    checkRemoveBackdrop();

	    //move focus to specified element if available, or else to body
	    if (elementToReceiveFocus && elementToReceiveFocus.focus) {
	      elementToReceiveFocus.focus();
	    } else if (appendToElement.focus) {
	      appendToElement.focus();
	    }
	  }

	  // Add or remove "windowTopClass" from the top window in the stack
	  function toggleTopWindowClass(toggleSwitch) {
	    var modalWindow;

	    if (openedWindows.length() > 0) {
	      modalWindow = openedWindows.top().value;
	      modalWindow.modalDomEl.toggleClass(modalWindow.windowTopClass || '', toggleSwitch);
	    }
	  }

	  function checkRemoveBackdrop() {
	    //remove backdrop if no longer needed
	    if (backdropDomEl && backdropIndex() === -1) {
	      var backdropScopeRef = backdropScope;
	      removeAfterAnimate(backdropDomEl, backdropScope, function () {
	        backdropScopeRef = null;
	      });
	      backdropDomEl = undefined;
	      backdropScope = undefined;
	    }
	  }

	  function removeAfterAnimate(domEl, scope, done, closedDeferred) {
	    var asyncDeferred;
	    var asyncPromise = null;
	    var setIsAsync = function setIsAsync() {
	      if (!asyncDeferred) {
	        asyncDeferred = $q.defer();
	        asyncPromise = asyncDeferred.promise;
	      }

	      return function asyncDone() {
	        asyncDeferred.resolve();
	      };
	    };
	    scope.$broadcast($modalStack.NOW_CLOSING_EVENT, setIsAsync);

	    // Note that it's intentional that asyncPromise might be null.
	    // That's when setIsAsync has not been called during the
	    // NOW_CLOSING_EVENT broadcast.
	    return $q.when(asyncPromise).then(afterAnimating);

	    function afterAnimating() {
	      if (afterAnimating.done) {
	        return;
	      }
	      afterAnimating.done = true;

	      $animate.leave(domEl).then(function () {
	        if (done) {
	          done();
	        }

	        domEl.remove();
	        if (closedDeferred) {
	          closedDeferred.resolve();
	        }
	      });

	      scope.$destroy();
	    }
	  }

	  $document.on('keydown', keydownListener);

	  $rootScope.$on('$destroy', function () {
	    $document.off('keydown', keydownListener);
	  });

	  function keydownListener(evt) {
	    if (evt.isDefaultPrevented()) {
	      return evt;
	    }

	    var modal = openedWindows.top();
	    if (modal) {
	      switch (evt.which) {
	        case 27:
	          {
	            if (modal.value.keyboard) {
	              evt.preventDefault();
	              $rootScope.$apply(function () {
	                $modalStack.dismiss(modal.key, 'escape key press');
	              });
	            }
	            break;
	          }
	        case 9:
	          {
	            var list = $modalStack.loadFocusElementList(modal);
	            var focusChanged = false;
	            if (evt.shiftKey) {
	              if ($modalStack.isFocusInFirstItem(evt, list) || $modalStack.isModalFocused(evt, modal)) {
	                focusChanged = $modalStack.focusLastFocusableElement(list);
	              }
	            } else {
	              if ($modalStack.isFocusInLastItem(evt, list)) {
	                focusChanged = $modalStack.focusFirstFocusableElement(list);
	              }
	            }

	            if (focusChanged) {
	              evt.preventDefault();
	              evt.stopPropagation();
	            }

	            break;
	          }
	      }
	    }
	  }

	  $modalStack.open = function (modalInstance, modal) {
	    var modalOpener = $document[0].activeElement,
	        modalBodyClass = modal.openedClass || OPENED_MODAL_CLASS;

	    toggleTopWindowClass(false);

	    // Store the current top first, to determine what index we ought to use
	    // for the current top modal
	    previousTopOpenedModal = openedWindows.top();

	    openedWindows.add(modalInstance, {
	      deferred: modal.deferred,
	      renderDeferred: modal.renderDeferred,
	      closedDeferred: modal.closedDeferred,
	      modalScope: modal.scope,
	      backdrop: modal.backdrop,
	      keyboard: modal.keyboard,
	      openedClass: modal.openedClass,
	      windowTopClass: modal.windowTopClass,
	      animation: modal.animation,
	      appendTo: modal.appendTo
	    });

	    openedClasses.put(modalBodyClass, modalInstance);

	    var appendToElement = modal.appendTo,
	        currBackdropIndex = backdropIndex();

	    if (currBackdropIndex >= 0 && !backdropDomEl) {
	      backdropScope = $rootScope.$new(true);
	      backdropScope.modalOptions = modal;
	      backdropScope.index = currBackdropIndex;
	      backdropDomEl = angular.element('<div uib-modal-backdrop="modal-backdrop"></div>');
	      backdropDomEl.attr({
	        'class': 'modal-backdrop',
	        'ng-style': '{\'z-index\': 1040 + (index && 1 || 0) + index*10}',
	        'uib-modal-animation-class': 'fade',
	        'modal-in-class': 'in'
	      });
	      if (modal.backdropClass) {
	        backdropDomEl.addClass(modal.backdropClass);
	      }

	      if (modal.animation) {
	        backdropDomEl.attr('modal-animation', 'true');
	      }
	      $compile(backdropDomEl)(backdropScope);
	      $animate.enter(backdropDomEl, appendToElement);
	      if ($uibPosition.isScrollable(appendToElement)) {
	        scrollbarPadding = $uibPosition.scrollbarPadding(appendToElement);
	        if (scrollbarPadding.heightOverflow && scrollbarPadding.scrollbarWidth) {
	          appendToElement.css({ paddingRight: scrollbarPadding.right + 'px' });
	        }
	      }
	    }

	    var content;
	    if (modal.component) {
	      content = document.createElement(snake_case(modal.component.name));
	      content = angular.element(content);
	      content.attr({
	        resolve: '$resolve',
	        'modal-instance': '$uibModalInstance',
	        close: '$close($value)',
	        dismiss: '$dismiss($value)'
	      });
	    } else {
	      content = modal.content;
	    }

	    // Set the top modal index based on the index of the previous top modal
	    topModalIndex = previousTopOpenedModal ? parseInt(previousTopOpenedModal.value.modalDomEl.attr('index'), 10) + 1 : 0;
	    var angularDomEl = angular.element('<div uib-modal-window="modal-window"></div>');
	    angularDomEl.attr({
	      'class': 'modal',
	      'template-url': modal.windowTemplateUrl,
	      'window-top-class': modal.windowTopClass,
	      'role': 'dialog',
	      'aria-labelledby': modal.ariaLabelledBy,
	      'aria-describedby': modal.ariaDescribedBy,
	      'size': modal.size,
	      'index': topModalIndex,
	      'animate': 'animate',
	      'ng-style': '{\'z-index\': 1050 + $$topModalIndex*10, display: \'block\'}',
	      'tabindex': -1,
	      'uib-modal-animation-class': 'fade',
	      'modal-in-class': 'in'
	    }).append(content);
	    if (modal.windowClass) {
	      angularDomEl.addClass(modal.windowClass);
	    }

	    if (modal.animation) {
	      angularDomEl.attr('modal-animation', 'true');
	    }

	    appendToElement.addClass(modalBodyClass);
	    if (modal.scope) {
	      // we need to explicitly add the modal index to the modal scope
	      // because it is needed by ngStyle to compute the zIndex property.
	      modal.scope.$$topModalIndex = topModalIndex;
	    }
	    $animate.enter($compile(angularDomEl)(modal.scope), appendToElement);

	    openedWindows.top().value.modalDomEl = angularDomEl;
	    openedWindows.top().value.modalOpener = modalOpener;

	    applyAriaHidden(angularDomEl);

	    function applyAriaHidden(el) {
	      if (!el || el[0].tagName === 'BODY') {
	        return;
	      }

	      getSiblings(el).forEach(function (sibling) {
	        var elemIsAlreadyHidden = sibling.getAttribute('aria-hidden') === 'true',
	            ariaHiddenCount = parseInt(sibling.getAttribute(ARIA_HIDDEN_ATTRIBUTE_NAME), 10);

	        if (!ariaHiddenCount) {
	          ariaHiddenCount = elemIsAlreadyHidden ? 1 : 0;
	        }

	        sibling.setAttribute(ARIA_HIDDEN_ATTRIBUTE_NAME, ariaHiddenCount + 1);
	        sibling.setAttribute('aria-hidden', 'true');
	      });

	      return applyAriaHidden(el.parent());

	      function getSiblings(el) {
	        var children = el.parent() ? el.parent().children() : [];

	        return Array.prototype.filter.call(children, function (child) {
	          return child !== el[0];
	        });
	      }
	    }
	  };

	  function broadcastClosing(modalWindow, resultOrReason, closing) {
	    return !modalWindow.value.modalScope.$broadcast('modal.closing', resultOrReason, closing).defaultPrevented;
	  }

	  function unhideBackgroundElements() {
	    Array.prototype.forEach.call(document.querySelectorAll('[' + ARIA_HIDDEN_ATTRIBUTE_NAME + ']'), function (hiddenEl) {
	      var ariaHiddenCount = parseInt(hiddenEl.getAttribute(ARIA_HIDDEN_ATTRIBUTE_NAME), 10),
	          newHiddenCount = ariaHiddenCount - 1;
	      hiddenEl.setAttribute(ARIA_HIDDEN_ATTRIBUTE_NAME, newHiddenCount);

	      if (!newHiddenCount) {
	        hiddenEl.removeAttribute(ARIA_HIDDEN_ATTRIBUTE_NAME);
	        hiddenEl.removeAttribute('aria-hidden');
	      }
	    });
	  }

	  $modalStack.close = function (modalInstance, result) {
	    var modalWindow = openedWindows.get(modalInstance);
	    unhideBackgroundElements();
	    if (modalWindow && broadcastClosing(modalWindow, result, true)) {
	      modalWindow.value.modalScope.$$uibDestructionScheduled = true;
	      modalWindow.value.deferred.resolve(result);
	      removeModalWindow(modalInstance, modalWindow.value.modalOpener);
	      return true;
	    }

	    return !modalWindow;
	  };

	  $modalStack.dismiss = function (modalInstance, reason) {
	    var modalWindow = openedWindows.get(modalInstance);
	    unhideBackgroundElements();
	    if (modalWindow && broadcastClosing(modalWindow, reason, false)) {
	      modalWindow.value.modalScope.$$uibDestructionScheduled = true;
	      modalWindow.value.deferred.reject(reason);
	      removeModalWindow(modalInstance, modalWindow.value.modalOpener);
	      return true;
	    }
	    return !modalWindow;
	  };

	  $modalStack.dismissAll = function (reason) {
	    var topModal = this.getTop();
	    while (topModal && this.dismiss(topModal.key, reason)) {
	      topModal = this.getTop();
	    }
	  };

	  $modalStack.getTop = function () {
	    return openedWindows.top();
	  };

	  $modalStack.modalRendered = function (modalInstance) {
	    var modalWindow = openedWindows.get(modalInstance);
	    if (modalWindow) {
	      modalWindow.value.renderDeferred.resolve();
	    }
	  };

	  $modalStack.focusFirstFocusableElement = function (list) {
	    if (list.length > 0) {
	      list[0].focus();
	      return true;
	    }
	    return false;
	  };

	  $modalStack.focusLastFocusableElement = function (list) {
	    if (list.length > 0) {
	      list[list.length - 1].focus();
	      return true;
	    }
	    return false;
	  };

	  $modalStack.isModalFocused = function (evt, modalWindow) {
	    if (evt && modalWindow) {
	      var modalDomEl = modalWindow.value.modalDomEl;
	      if (modalDomEl && modalDomEl.length) {
	        return (evt.target || evt.srcElement) === modalDomEl[0];
	      }
	    }
	    return false;
	  };

	  $modalStack.isFocusInFirstItem = function (evt, list) {
	    if (list.length > 0) {
	      return (evt.target || evt.srcElement) === list[0];
	    }
	    return false;
	  };

	  $modalStack.isFocusInLastItem = function (evt, list) {
	    if (list.length > 0) {
	      return (evt.target || evt.srcElement) === list[list.length - 1];
	    }
	    return false;
	  };

	  $modalStack.loadFocusElementList = function (modalWindow) {
	    if (modalWindow) {
	      var modalDomE1 = modalWindow.value.modalDomEl;
	      if (modalDomE1 && modalDomE1.length) {
	        var elements = modalDomE1[0].querySelectorAll(tabbableSelector);
	        return elements ? Array.prototype.filter.call(elements, function (element) {
	          return isVisible(element);
	        }) : elements;
	      }
	    }
	  };

	  return $modalStack;
	}]).provider('$uibModal', function () {
	  var $modalProvider = {
	    options: {
	      animation: true,
	      backdrop: true, //can also be false or 'static'
	      keyboard: true
	    },
	    $get: ['$rootScope', '$q', '$document', '$templateRequest', '$controller', '$uibResolve', '$uibModalStack', function ($rootScope, $q, $document, $templateRequest, $controller, $uibResolve, $modalStack) {
	      var $modal = {};

	      function getTemplatePromise(options) {
	        return options.template ? $q.when(options.template) : $templateRequest(angular.isFunction(options.templateUrl) ? options.templateUrl() : options.templateUrl);
	      }

	      var promiseChain = null;
	      $modal.getPromiseChain = function () {
	        return promiseChain;
	      };

	      $modal.open = function (modalOptions) {
	        var modalResultDeferred = $q.defer();
	        var modalOpenedDeferred = $q.defer();
	        var modalClosedDeferred = $q.defer();
	        var modalRenderDeferred = $q.defer();

	        //prepare an instance of a modal to be injected into controllers and returned to a caller
	        var modalInstance = {
	          result: modalResultDeferred.promise,
	          opened: modalOpenedDeferred.promise,
	          closed: modalClosedDeferred.promise,
	          rendered: modalRenderDeferred.promise,
	          close: function close(result) {
	            return $modalStack.close(modalInstance, result);
	          },
	          dismiss: function dismiss(reason) {
	            return $modalStack.dismiss(modalInstance, reason);
	          }
	        };

	        //merge and clean up options
	        modalOptions = angular.extend({}, $modalProvider.options, modalOptions);
	        modalOptions.resolve = modalOptions.resolve || {};
	        modalOptions.appendTo = modalOptions.appendTo || $document.find('body').eq(0);

	        if (!modalOptions.appendTo.length) {
	          throw new Error('appendTo element not found. Make sure that the element passed is in DOM.');
	        }

	        //verify options
	        if (!modalOptions.component && !modalOptions.template && !modalOptions.templateUrl) {
	          throw new Error('One of component or template or templateUrl options is required.');
	        }

	        var templateAndResolvePromise;
	        if (modalOptions.component) {
	          templateAndResolvePromise = $q.when($uibResolve.resolve(modalOptions.resolve, {}, null, null));
	        } else {
	          templateAndResolvePromise = $q.all([getTemplatePromise(modalOptions), $uibResolve.resolve(modalOptions.resolve, {}, null, null)]);
	        }

	        function resolveWithTemplate() {
	          return templateAndResolvePromise;
	        }

	        // Wait for the resolution of the existing promise chain.
	        // Then switch to our own combined promise dependency (regardless of how the previous modal fared).
	        // Then add to $modalStack and resolve opened.
	        // Finally clean up the chain variable if no subsequent modal has overwritten it.
	        var samePromise;
	        samePromise = promiseChain = $q.all([promiseChain]).then(resolveWithTemplate, resolveWithTemplate).then(function resolveSuccess(tplAndVars) {
	          var providedScope = modalOptions.scope || $rootScope;

	          var modalScope = providedScope.$new();
	          modalScope.$close = modalInstance.close;
	          modalScope.$dismiss = modalInstance.dismiss;

	          modalScope.$on('$destroy', function () {
	            if (!modalScope.$$uibDestructionScheduled) {
	              modalScope.$dismiss('$uibUnscheduledDestruction');
	            }
	          });

	          var modal = {
	            scope: modalScope,
	            deferred: modalResultDeferred,
	            renderDeferred: modalRenderDeferred,
	            closedDeferred: modalClosedDeferred,
	            animation: modalOptions.animation,
	            backdrop: modalOptions.backdrop,
	            keyboard: modalOptions.keyboard,
	            backdropClass: modalOptions.backdropClass,
	            windowTopClass: modalOptions.windowTopClass,
	            windowClass: modalOptions.windowClass,
	            windowTemplateUrl: modalOptions.windowTemplateUrl,
	            ariaLabelledBy: modalOptions.ariaLabelledBy,
	            ariaDescribedBy: modalOptions.ariaDescribedBy,
	            size: modalOptions.size,
	            openedClass: modalOptions.openedClass,
	            appendTo: modalOptions.appendTo
	          };

	          var component = {};
	          var ctrlInstance,
	              ctrlInstantiate,
	              ctrlLocals = {};

	          if (modalOptions.component) {
	            constructLocals(component, false, true, false);
	            component.name = modalOptions.component;
	            modal.component = component;
	          } else if (modalOptions.controller) {
	            constructLocals(ctrlLocals, true, false, true);

	            // the third param will make the controller instantiate later,private api
	            // @see https://github.com/angular/angular.js/blob/master/src/ng/controller.js#L126
	            ctrlInstantiate = $controller(modalOptions.controller, ctrlLocals, true, modalOptions.controllerAs);
	            if (modalOptions.controllerAs && modalOptions.bindToController) {
	              ctrlInstance = ctrlInstantiate.instance;
	              ctrlInstance.$close = modalScope.$close;
	              ctrlInstance.$dismiss = modalScope.$dismiss;
	              angular.extend(ctrlInstance, {
	                $resolve: ctrlLocals.$scope.$resolve
	              }, providedScope);
	            }

	            ctrlInstance = ctrlInstantiate();

	            if (angular.isFunction(ctrlInstance.$onInit)) {
	              ctrlInstance.$onInit();
	            }
	          }

	          if (!modalOptions.component) {
	            modal.content = tplAndVars[0];
	          }

	          $modalStack.open(modalInstance, modal);
	          modalOpenedDeferred.resolve(true);

	          function constructLocals(obj, template, instanceOnScope, injectable) {
	            obj.$scope = modalScope;
	            obj.$scope.$resolve = {};
	            if (instanceOnScope) {
	              obj.$scope.$uibModalInstance = modalInstance;
	            } else {
	              obj.$uibModalInstance = modalInstance;
	            }

	            var resolves = template ? tplAndVars[1] : tplAndVars;
	            angular.forEach(resolves, function (value, key) {
	              if (injectable) {
	                obj[key] = value;
	              }

	              obj.$scope.$resolve[key] = value;
	            });
	          }
	        }, function resolveError(reason) {
	          modalOpenedDeferred.reject(reason);
	          modalResultDeferred.reject(reason);
	        })['finally'](function () {
	          if (promiseChain === samePromise) {
	            promiseChain = null;
	          }
	        });

	        return modalInstance;
	      };

	      return $modal;
	    }]
	  };

	  return $modalProvider;
	});

/***/ })
/******/ ]);