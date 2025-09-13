'use strict';
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const logger = require('../utils/logger');

async function _loadCCP(org) {
  const profilePath = org === 'Org1' ? process.env.ORG1_CONNECTION_PROFILE : process.env.ORG2_CONNECTION_PROFILE;
  const ccp = yaml.load(fs.readFileSync(profilePath, 'utf8'));
  return ccp;
}

async function _getWallet(org) {
  const walletPath = path.resolve(process.cwd(), process.env.WALLET_PATH || './wallet', org.toLowerCase());
  return await Wallets.newFileSystemWallet(walletPath);
}

async function _connectGateway(org, identity) {
  const ccp = await _loadCCP(org);
  const wallet = await _getWallet(org);
  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity,
    discovery: { enabled: false, asLocalhost: true }
  });
  return gateway;
}

/**
 * submitTransaction: submit (invoke) transaction to chaincode
 * - org: 'Org1' or 'Org2'
 * - identity: wallet identity name to use for signing (e.g., 'appUser' or admin)
 */
async function submitTransaction(org, identity, fcn, ...args) {
  const gateway = await _connectGateway(org, identity);
  try {
    const network = await gateway.getNetwork(process.env.CHANNEL_NAME);
    const contract = network.getContract(process.env.CHAINCODE_NAME);
    const result = await contract.submitTransaction(fcn, ...args);
    logger.info(`Submitted tx ${fcn} by ${identity} on ${org}`);
    return result;
  } finally {
    
    gateway.disconnect();
  }
}

async function evaluateTransaction(org, identity, fcn, ...args) {
  const gateway = await _connectGateway(org, identity);
  try {
    const network = await gateway.getNetwork(process.env.CHANNEL_NAME);
    const contract = network.getContract(process.env.CHAINCODE_NAME);
    const result = await contract.evaluateTransaction(fcn, ...args);
    logger.info(`Evaluated tx ${fcn} by ${identity} on ${org}`);
    return result;
  } finally {
    gateway.disconnect();
  }
}

module.exports = { submitTransaction, evaluateTransaction };
