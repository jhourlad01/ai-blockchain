// blockchainUtils.js

import crypto from 'crypto';
import { keccak256 } from 'js-sha3';
import { utils as ethersUtils } from 'ethers';

const AdvancedBlockchainUtils = {
  /**
   * Validate Ethereum address (basic + checksum)
   * @param {string} address
   * @returns {boolean}
   */
  isValidEthAddress(address) {
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return false;
    return this.toChecksumAddress(address) === address;
  },

  /**
   * Convert address to checksum address (EIP-55)
   * @param {string} address (lowercase or uppercase, 0x prefixed)
   * @returns {string}
   */
  toChecksumAddress(address) {
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) throw new Error('Invalid address');
    address = address.toLowerCase().replace('0x', '');
    const hash = keccak256(address);
    let checksumAddress = '0x';

    for (let i = 0; i < 40; i++) {
      checksumAddress +=
        parseInt(hash[i], 16) > 7
          ? address[i].toUpperCase()
          : address[i];
    }
    return checksumAddress;
  },

  /**
   * Format a transaction object for logging/display
   * @param {object} tx {from, to, value, gasLimit, gasPrice, nonce, data}
   * @returns {string}
   */
  formatTx(tx) {
    return `
    From: ${tx.from}
    To: ${tx.to}
    Value: ${ethersUtils.formatEther(tx.value || '0')}
    Gas Limit: ${tx.gasLimit}
    Gas Price: ${ethersUtils.formatUnits(tx.gasPrice || '0', 'gwei')} Gwei
    Nonce: ${tx.nonce}
    Data: ${tx.data || '0x'}
    `.trim();
  },

  /**
   * Convert hex string to decimal string (big number safe)
   * @param {string} hex
   * @returns {string}
   */
  hexToDecimal(hex) {
    return BigInt(hex).toString(10);
  },

  /**
   * Convert decimal string or number to hex string (0x prefixed)
   * @param {string|number|bigint} dec
   * @returns {string}
   */
  decimalToHex(dec) {
    return '0x' + BigInt(dec).toString(16);
  },

  /**
   * Encode function call data (ABI encoded) using ethers.js utils
   * @param {string} abiFunctionSignature e.g. "transfer(address,uint256)"
   * @param {Array} params params for the function
   * @returns {string} encoded data hex string
   */
  encodeFunctionCall(abiFunctionSignature, params) {
    const iface = new ethersUtils.Interface([`function ${abiFunctionSignature}`]);
    return iface.encodeFunctionData(abiFunctionSignature.split('(')[0], params);
  },

  /**
   * Decode function call data (ABI encoded)
   * @param {string} abiFunctionSignature
   * @param {string} data hex string
   * @returns {Array} decoded params
   */
  decodeFunctionCall(abiFunctionSignature, data) {
    const iface = new ethersUtils.Interface([`function ${abiFunctionSignature}`]);
    return iface.decodeFunctionData(abiFunctionSignature.split('(')[0], data);
  },

  /**
   * Simple Merkle proof verification
   * @param {string} leafHash Hex string of leaf hash
   * @param {Array<string>} proof Array of sibling hashes in hex string
   * @param {string} rootHash Hex string of Merkle root
   * @returns {boolean} valid or not
   */
  verifyMerkleProof(leafHash, proof, rootHash) {
    let computedHash = leafHash.toLowerCase();

    proof.forEach((proofElement) => {
      if (computedHash < proofElement.toLowerCase()) {
        computedHash = keccak256(Buffer.concat([
          Buffer.from(computedHash.replace(/^0x/, ''), 'hex'),
          Buffer.from(proofElement.replace(/^0x/, ''), 'hex')
        ]));
      } else {
        computedHash = keccak256(Buffer.concat([
          Buffer.from(proofElement.replace(/^0x/, ''), 'hex'),
          Buffer.from(computedHash.replace(/^0x/, ''), 'hex')
        ]));
      }
    });

    return computedHash === rootHash.toLowerCase().replace(/^0x/, '');
  },

  /**
   * SHA256 hash of input (hex string output)
   * @param {string|Buffer} data
   * @returns {string}
   */
  sha256(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  },

  /**
   * Keccak256 hash (hex string output)
   * @param {string|Buffer} data
   * @returns {string}
   */
  keccak256(data) {
    return '0x' + keccak256(data);
  },

  /**
   * Generate random Ethereum wallet
   * @returns {{address:string, privateKey:string}}
   */
  generateWallet() {
    const wallet = ethersUtils.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
  },

  /**
   * Derive Ethereum address from private key
   * @param {string} privateKey
   * @returns {string} address
   */
  getAddressFromPrivateKey(privateKey) {
    return new ethersUtils.Wallet(privateKey).address;
  }
};

export default AdvancedBlockchainUtils;
