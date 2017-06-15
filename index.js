const bitcore = require('reddcore');
const electrum = require('./node_modules/reddcoin-electrum-js/electrum');

const reddcoin = {
    wallet: false,
    monitor: false,

    render: function () {

      var addresses = this.wallet.getAddresses();
      var transactions = this.wallet.getTransactions();

      for(var i = 0; i < addresses.length; i++){
        var addr = addresses[i];
        var val = bitcore.util.formatValue(addr.confirmed) + ' RDD';
        console.log('Address ('+ addr.address  +') #' + i + ': ' + val);
      }

    },

    create: function (seed, password) {

        var monitor = electrum.NetworkMonitor;

        // init a wallet
        this.wallet = electrum.WalletFactory.standardWallet(),

        // setup wallet password
        this.wallet.buildFromMnemonic(seed.trim(), password.trim());

        // response layer
        this.monitor = monitor.start(this.wallet);

        // init the wallet? need to confirm
        this.wallet.activateAccount();

        // output data
        this.render();
    },

    send: function () {
        var addr = $("#toAddress").val(),
            amount = $("#amount").val();
        this.wallet.send(amount, addr, this.monitor);
    },

    get: function(){
      return this.wallet;
    }

}

/*
  Create / recover - needs confirmation
 */
reddcoin.create('victory pilot network forward trend cup glass grape weird license melody shy', 'Asecurepassword@11');


/*
  EG: Creating a new wallet, generate a new seed
  this.wallet.getNewSeed()
 */