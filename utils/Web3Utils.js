// web3-utils.js

const Web3Utils = {
  // Basic conversions
  toWei(amount, unit = 'ether') {
    return Web3.utils.toWei(amount.toString(), unit);
  },

  fromWei(amount, unit = 'ether') {
    return Web3.utils.fromWei(amount.toString(), unit);
  },

  isValidAddress(address) {
    return Web3.utils.isAddress(address);
  },

  toChecksumAddress(address) {
    return Web3.utils.toChecksumAddress(address);
  },

  // -------------------
  // Advanced helpers
  // -------------------

  /**
   * Batch calls multiple contract methods using Multicall pattern.
   * Requires a Multicall contract deployed (https://github.com/makerdao/multicall)
   * @param {Web3} web3 - web3 instance
   * @param {string} multicallAddress - multicall contract address
   * @param {Array} calls - [{target, callData}, ...]
   * @returns {Promise<Array>} decoded return data
   */
  multicall: async function (web3, multicallAddress, calls) {
    const multicallAbi = [{
      "constant": true,
      "inputs": [{ "components": [{ "name": "target", "type": "address" }, { "name": "callData", "type": "bytes" }], "name": "calls", "type": "tuple[]" }],
      "name": "aggregate",
      "outputs": [{ "name": "blockNumber", "type": "uint256" }, { "name": "returnData", "type": "bytes[]" }],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    }];
    const contract = new web3.eth.Contract(multicallAbi, multicallAddress);
    const { returnData } = await contract.methods.aggregate(calls).call();
    return returnData;
  },

  /**
   * Encode ABI for contract method call, supports nested structs
   * @param {Object} abiMethod - ABI method object from contract.methods
   * @param {Array} params - Parameters to encode
   * @returns {string} encoded ABI call data
   */
  encodeMethodCall(abiMethod, params) {
    return abiMethod.encodeABI(params);
  },

  /**
   * Decode event logs by event ABI
   * @param {Object} eventAbi - event ABI object
   * @param {string} data - hex data
   * @param {Array} topics - log topics
   * @returns {Object} decoded event parameters
   */
  decodeEvent(eventAbi, data, topics) {
    return Web3.eth.abi.decodeLog(eventAbi.inputs, data, topics.slice(1));
  },

  /**
   * Approve ERC20 token allowance for spender if current allowance is insufficient.
   * Handles allowance race condition by setting to zero first if needed.
   * @param {Web3} web3 - web3 instance
   * @param {string} tokenAddress - ERC20 token contract address
   * @param {string} owner - token owner address
   * @param {string} spender - address to approve
   * @param {string|BN} amount - amount to approve (in token decimals)
   * @param {string} privateKey - owner's private key to sign transactions
   * @returns {Promise<string>} txHash of approval
   */
  approveERC20: async function (web3, tokenAddress, owner, spender, amount, privateKey) {
    const erc20Abi = [
      { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "remaining", "type": "uint256" }], "type": "function" },
      { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "success", "type": "bool" }], "type": "function" }
    ];
    const tokenContract = new web3.eth.Contract(erc20Abi, tokenAddress);
    const currentAllowance = await tokenContract.methods.allowance(owner, spender).call();
    if (BigInt(currentAllowance) >= BigInt(amount)) return null; // Already approved

    // Reset allowance to zero first (ERC20 race condition fix)
    if (BigInt(currentAllowance) > 0n) {
      const tx0 = tokenContract.methods.approve(spender, 0);
      const gas0 = await tx0.estimateGas({ from: owner });
      const data0 = tx0.encodeABI();
      const txCount = await web3.eth.getTransactionCount(owner);
      const txObject0 = {
        from: owner,
        to: tokenAddress,
        gas: gas0,
        data: data0,
        nonce: txCount,
      };
      const signedTx0 = await web3.eth.accounts.signTransaction(txObject0, privateKey);
      await web3.eth.sendSignedTransaction(signedTx0.rawTransaction);
    }

    // Approve the desired amount
    const tx1 = tokenContract.methods.approve(spender, amount);
    const gas1 = await tx1.estimateGas({ from: owner });
    const data1 = tx1.encodeABI();
    const nonce = await web3.eth.getTransactionCount(owner);
    const txObject1 = {
      from: owner,
      to: tokenAddress,
      gas: gas1,
      data: data1,
      nonce,
    };
    const signedTx1 = await web3.eth.accounts.signTransaction(txObject1, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx1.rawTransaction);
    return receipt.transactionHash;
  },

  /**
   * Deploy a contract from ABI and bytecode with constructor args.
   * @param {Web3} web3
   * @param {Object} abi
   * @param {string} bytecode
   * @param {Array} constructorArgs
   * @param {string} deployerAddress
   * @param {string} privateKey
   * @returns {Promise<string>} deployed contract address
   */
  deployContract: async function (web3, abi, bytecode, constructorArgs, deployerAddress, privateKey) {
    const contract = new web3.eth.Contract(abi);
    const deployTx = contract.deploy({ data: bytecode, arguments: constructorArgs });
    const gas = await deployTx.estimateGas({ from: deployerAddress });
    const data = deployTx.encodeABI();
    const nonce = await web3.eth.getTransactionCount(deployerAddress);

    const tx = {
      from: deployerAddress,
      data,
      gas,
      nonce
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    return receipt.contractAddress;
  },

  /**
   * Compute EIP-712 typed data signature (v4) using web3.eth.accounts
   * @param {Object} typedData - Typed data structured per EIP-712 standard
   * @param {string} privateKey - signer private key
   * @returns {string} signature hex string
   */
  signTypedDataV4: (typedData, privateKey) => {
    return Web3.eth.accounts.signTypedData(typedData, privateKey);
  },

  /**
   * Get gas price with priority fee for EIP-1559 compatible chains.
   * Falls back to legacy gas price if not supported.
   * @param {Web3} web3
   * @returns {Promise<Object>} { maxFeePerGas, maxPriorityFeePerGas } in wei
   */
  getGasPriceEIP1559: async function (web3) {
    try {
      const baseFee = (await web3.eth.getBlock('pending')).baseFeePerGas;
      if (!baseFee) throw new Error('No baseFeePerGas');

      const maxPriorityFeePerGas = Web3.utils.toWei('2', 'gwei'); // 2 gwei priority fee
      const maxFeePerGas = BigInt(baseFee) + BigInt(maxPriorityFeePerGas);

      return {
        maxFeePerGas: maxFeePerGas.toString(),
        maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
      };
    } catch {
      // Fallback legacy gas price
      const gasPrice = await web3.eth.getGasPrice();
      return { gasPrice };
    }
  },

  /**
   * Calculate token amount from decimals and human-readable amount
   * @param {string|number} amount - human readable amount (e.g. 1.5)
   * @param {number} decimals - token decimals
   * @returns {string} amount in token units (wei)
   */
  parseTokenAmount(amount, decimals) {
    const [integerPart, fractionalPart = ''] = amount.toString().split('.');
    if (fractionalPart.length > decimals) throw new Error('Too many decimal places');
    const paddedFractional = fractionalPart.padEnd(decimals, '0');
    return BigInt(integerPart + paddedFractional).toString();
  },

  /**
   * Format token amount (BigInt string) to human-readable string with decimals
   * @param {string|BigInt} amount
   * @param {number} decimals
   * @returns {string}
   */
  formatTokenAmount(amount, decimals) {
    amount = amount.toString();
    if (amount.length <= decimals) {
      return '0.' + amount.padStart(decimals, '0');
    }
    const intPart = amount.slice(0, amount.length - decimals);
    const fracPart = amount.slice(amount.length - decimals).replace(/0+$/, '');
    return fracPart.length > 0 ? `${intPart}.${fracPart}` : intPart;
  },

  /**
   * Decode revert reason from transaction receipt or call return data
   * @param {string} data - hex revert data
   * @returns {string} decoded revert reason or empty string
   */
  decodeRevertReason(data) {
    if (!data || data === '0x') return '';
    try {
      // Remove method selector (4 bytes)
      const reasonHex = '0x' + data.slice(10);
      return Web3.utils.hexToAscii(reasonHex).replace(/\0/g, '');
    } catch {
      return '';
    }
  },

  /**
   * Wait for a transaction to be mined with timeout
   * @param {Web3} web3
   * @param {string} txHash
   * @param {number} timeoutMs
   * @returns {Promise<Object>} transaction receipt
   */
  waitForReceipt: async function (web3, txHash, timeoutMs = 120000) {
    const start = Date.now();
    while (true) {
      const receipt = await web3.eth.getTransactionReceipt(txHash);
      if (receipt) return receipt;
      if (Date.now() - start > timeoutMs) throw new Error('Timeout waiting for receipt');
      await new Promise(r => setTimeout(r, 1000));
    }
  }
};

if (typeof module !== 'undefined') {
  module.exports = Web3Utils;
}
