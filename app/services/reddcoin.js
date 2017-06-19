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
  create: function (seed, password, type) {

      var monitor = electrum.NetworkMonitor;

      // checks its a valid mnemonic
      if(this.wallet.checkSeed(seed)){

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
  sendPayment: function (addr, amount, sendFrom, password, seed) {
    // amount, accIndex, requirePw, to, password, monitor
    this.wallet.send(amount, sendFrom, false, addr, password, this.monitor);
  },

  /**
   * Get Current Wallet Instance
   * @return object
   */
  getWalletInstance: function(){
    return this.wallet;
  },

  /**
   * Generate a new BIP39 Seed and return
   * @return string
   */
  generateSeed: function(){
    return this.wallet.getNewSeed();
  },

  /**
   * Get a sorted array of transactions
   * no dupes
   */
  getTransactions: function(){


    let transactions;
    let array = this.wallet.getTransactions();

    for(let i = 0; i < array.length; i++){

      if(typeof transactions[ array[i].address ] === 'undefined'){
        transactions[ array[i].address ] = {};
      }

      transactions[ array[i].address ][ array[i].id ] = array[0]
    }

    return transactions;
  }

}