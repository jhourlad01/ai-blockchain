const apiUrl = process.env.NEXT_PUBLIC_ONCHAIN_API_URL || '/api/onchain';

useEffect(() => {
  async function fetchData() {
    const res = await fetch(apiUrl);
    const data = await res.json();

    setChartData({
      labels: data.map(d => d.date),
      datasets: [
        {
          label: 'Transaction Count',
          data: data.map(d => d.txCount),
          borderColor: 'blue',
          yAxisID: 'y1',
          fill: false,
        },
        {
          label: 'Avg Gas Price (Gwei)',
          data: data.map(d => d.avgGasPrice),
          borderColor: 'orange',
          yAxisID: 'y2',
          fill: false,
        },
      ],
    });
  }

  fetchData();
}, [apiUrl]);
