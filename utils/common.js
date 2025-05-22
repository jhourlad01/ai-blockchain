// utils.js

async function fetchEtherscanTxData(apiKey, address, startBlock, endBlock) {
  const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=${endBlock}&sort=asc&apikey=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.status !== '1') throw new Error(data.message);
  return data.result;
}

// Example: fetch daily average gas price and tx counts
async function fetchDailyTxAndGas(apiKey, address, days = 7) {
  const now = Math.floor(Date.now() / 1000);
  const oneDay = 86400;
  const results = [];

  for (let i = days; i > 0; i--) {
    const start = now - i * oneDay;
    const end = start + oneDay;

    // You would ideally query block ranges for the day or aggregate via APIs
    // Here we simulate by filtering fetched txs for simplicity

    const txs = await fetchEtherscanTxData(apiKey, address, 0, 99999999);
    const dailyTxs = txs.filter(tx => {
      const timestamp = parseInt(tx.timeStamp, 10);
      return timestamp >= start && timestamp < end;
    });

    const avgGasPrice = dailyTxs.length
      ? dailyTxs.reduce((sum, tx) => sum + Number(tx.gasPrice), 0) / dailyTxs.length
      : 0;

    results.push({
      date: new Date(start * 1000).toISOString().split('T')[0],
      txCount: dailyTxs.length,
      avgGasPrice: avgGasPrice / 1e9, // Convert wei to gwei
    });
  }
  return results;
}
