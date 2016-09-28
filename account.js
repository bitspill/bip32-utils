var bitcoinjs = require('bitcoinjs-lib')

var Chain = require('./chain')

function Account (chains) {
  this.chains = chains
}

Account.fromJSON = function (json, network) {
  var chains = json.map(function (j) {
    var node = bitcoinjs.HDNode.fromBase58(j.node, network)

    var chain = new Chain(node, j.k)
    chain.map = j.map

    // derive from k map
    chain.addresses = Object.keys(chain.map).sort(function (a, b) {
      return chain.map[a] - chain.map[b]
    })

    return chain
  })

  return new Account(chains)
}

Account.prototype.containsAddress = function (address) {
  return this.chains.some(function (chain) {
    return chain.find(address) !== undefined
  })
}

Account.prototype.getAllAddresses = function () {
  return [].concat.apply([], this.chains.map(function (chain) {
    return chain.getAll()
  }))
}

Account.prototype.getChain = function (i) { return this.chains[i] }
Account.prototype.getChains = function () { return this.chains }
Account.prototype.getChainAddress = function (i) { return this.chains[i].get() }
Account.prototype.getNetwork = function () { return this.chains[0].getParent().keyPair.network }

Account.prototype.isChainAddress = function (i, address) {
  return this.chains[i].find(address) !== undefined
}

Account.prototype.nextChainAddress = function (i) {
  return this.chains[i].next()
}

Account.prototype.toJSON = function () {
  return this.chains.map(function (chain) {
    return {
      k: chain.k,
      map: chain.map,
      node: chain.getParent().toBase58()
    }
  })
}

module.exports = Account