module.exports = function(){

  this.get = function(id){
    return null !== localStorage.getItem(id) ? localStorage.getItem(id) : false;
  },

  this.set = function(id, data){
    localStorage.setItem(id, data)
  },

  this.remove = function(id){
    localStorage.removeItem($id);
  }

}