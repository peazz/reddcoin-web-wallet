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
  sendPayment: function (addr, amount, sendFrom, password) {

    // amount, accIndex, requirePw, to, password, monitor
    this.wallet.send(amount, sendFrom, false, addr, password, this.monitor);

  },

  /**
   * Get Current Wallet Instance
   * @return object
   */
  getWallet: function(){
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