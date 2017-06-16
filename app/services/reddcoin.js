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
  create: function (seed, password) {

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
  send: function () {
      var addr = $("#toAddress").val(),
          amount = $("#amount").val();
      this.wallet.send(amount, addr, this.monitor);
  },

  /**
   * Get Current Wallet Instance
   * @return object
   */
  get: function(){
    return this.wallet;
  },

  /**
   * Generate a new BIP39 Seed and return
   * @return string
   */
  generateSeed: function(){
    return this.wallet.getNewSeed();
  }

}