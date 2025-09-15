import React, { useEffect, useState, useCallback } from "react";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

const API_KEY = "d346l5hr01qqt8snothgd346l5hr01qqt8snoti0";
const STOCKS_DATA = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "META", name: "Meta Platforms Inc." },
  { symbol: "NFLX", name: "Netflix Inc." },
  { symbol: "ADBE", name: "Adobe Inc." },
  { symbol: "INTC", name: "Intel Corporation" },
  { symbol: "ORCL", name: "Oracle Corporation" },
  { symbol: "IBM", name: "International Business Machines" },
  { symbol: "PYPL", name: "PayPal Holdings Inc." },
  { symbol: "CRM", name: "Salesforce Inc." },
  { symbol: "SHOP", name: "Shopify Inc." }
];

const StockTable: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);

  const fetchStock = useCallback(async () => {
    setLoading(true);
    setError("");
    const results: Stock[] = [];

    for (const stockData of STOCKS_DATA) {
      try {
        const res = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${stockData.symbol}&token=${API_KEY}`
        );
        const data = await res.json();

        if (!data || !data.c) {
          console.warn(`No data for ${stockData.symbol}`, data);
          results.push({ 
            symbol: stockData.symbol, 
            name: stockData.name,
            price: 0, 
            change: 0 
          });
        } else {
          const price = data.c;
          const change = data.dp;
          results.push({ 
            symbol: stockData.symbol, 
            name: stockData.name,
            price, 
            change 
          });
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        console.error(`Error fetching ${stockData.symbol}:`, err);
        results.push({ 
          symbol: stockData.symbol, 
          name: stockData.name,
          price: 0, 
          change: 0 
        });
      }
    }

    setStocks(results);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStock();
    const intervalId = setInterval(fetchStock, 300000);
    return () => clearInterval(intervalId);
  }, [fetchStock]);

  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedStocks = React.useMemo(() => {
    if (!sortConfig) return stocks;
    
    return [...stocks].sort((a, b) => {
      if (a[sortConfig.key as keyof Stock] < b[sortConfig.key as keyof Stock]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key as keyof Stock] > b[sortConfig.key as keyof Stock]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [stocks, sortConfig]);

  const getChangeIcon = (change: number) => {
    if (change > 0) return '↗';
    if (change < 0) return '↘';
    return '→';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="stock-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Stock Dashboard</h1>
          <p>Real-time stock prices and performance data for major companies</p>
        </div>
        <div className="header-actions">
          {lastUpdated && (
            <div className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          <button
            onClick={fetchStock}
            disabled={loading}
            className="refresh-btn"
          >
            <i className={`fas fa-sync ${loading ? 'fa-spin' : ''}`}></i>
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      <div className="table-container">
        <table className="stock-table">
          <thead>
            <tr>
              <th 
                className="sortable"
                onClick={() => handleSort('name')}
              >
                <div className="th-content">
                  Company
                  {sortConfig?.key === 'name' && (
                    <span className="sort-icon">
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="sortable"
                onClick={() => handleSort('symbol')}
              >
                <div className="th-content">
                  Symbol
                  {sortConfig?.key === 'symbol' && (
                    <span className="sort-icon">
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="sortable"
                onClick={() => handleSort('price')}
              >
                <div className="th-content">
                  Price
                  {sortConfig?.key === 'price' && (
                    <span className="sort-icon">
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="sortable"
                onClick={() => handleSort('change')}
              >
                <div className="th-content">
                  Change
                  {sortConfig?.key === 'change' && (
                    <span className="sort-icon">
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <tr key={index}>
                  <td>
                    <div className="company-cell">
                      <div className="symbol-skeleton"></div>
                    </div>
                  </td>
                  <td>
                    <div className="symbol-skeleton"></div>
                  </td>
                  <td>
                    <div className="price-skeleton"></div>
                  </td>
                  <td>
                    <div className="change-skeleton"></div>
                  </td>
                </tr>
              ))
            ) : (
              sortedStocks.map((stock) => (
                <tr key={stock.symbol}>
                  <td>
                    <div className="company-cell">
                      <div className="symbol-icon">
                        {stock.symbol[0]}
                      </div>
                      <div className="company-info">
                        <div className="company-name">{stock.name}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="stock-symbol">{stock.symbol}</div>
                  </td>
                  <td>
                    {stock.price > 0 ? formatPrice(stock.price) : 'N/A'}
                  </td>
                  <td className={stock.change > 0 ? "positive" : stock.change < 0 ? "negative" : "neutral"}>
                    <span className="change-indicator">
                      {getChangeIcon(stock.change)}
                      {stock.change !== 0 ? (
                        <>
                          {Math.abs(stock.change).toFixed(2)}%
                        </>
                      ) : (
                        '0.00%'
                      )}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="dashboard-footer">
        <div className="stock-count">
          Showing {stocks.length} stocks
        </div>
        <div className="data-provider">
          <i className="fas fa-database"></i>
          Data provided by Finnhub
        </div>
      </div>

      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Stock Dashboard. All data is for demonstration purposes only.</p>
      </footer>

      <style>{`
        .stock-dashboard {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          background: #1a1f36;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
          color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }
        
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .header-content h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 8px 0;
          background: linear-gradient(90deg, #4f46e5, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .header-content p {
          color: #94a3b8;
          margin: 0;
          font-size: 14px;
        }
        
        .header-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
        }
        
        .last-updated {
          color: #64748b;
          font-size: 13px;
        }
        
        .refresh-btn {
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 10px 16px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s;
        }
        
        .refresh-btn:hover {
          background: #2563eb;
        }
        
        .refresh-btn:disabled {
          background: #64748b;
          cursor: not-allowed;
        }
        
        .error-message {
          background: #7f1d1d;
          color: #fecaca;
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .table-container {
          background: #0f172a;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 20px;
          overflow-x: auto;
        }
        
        .stock-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }
        
        .stock-table th {
          background: #131c2f;
          padding: 16px;
          text-align: left;
          font-weight: 600;
          color: #94a3b8;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .sortable {
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .sortable:hover {
          background: #1e293b;
        }
        
        .th-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .sort-icon {
          font-size: 12px;
        }
        
        .stock-table td {
          padding: 16px;
          border-bottom: 1px solid #1e293b;
        }
        
        .stock-table tr:last-child td {
          border-bottom: none;
        }
        
        .stock-table tr:hover {
          background: rgba(255, 255, 255, 0.03);
        }
        
        .company-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .symbol-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
        }
        
        .company-info {
          display: flex;
          flex-direction: column;
        }
        
        .company-name {
          font-weight: 600;
          font-size: 14px;
        }
        
        .stock-symbol {
          color: #94a3b8;
          font-size: 13px;
          font-weight: 500;
        }
        
        .positive {
          color: #4ade80;
        }
        
        .negative {
          color: #f87171;
        }
        
        .neutral {
          color: #94a3b8;
        }
        
        .change-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
        }
        
        .symbol-skeleton, .price-skeleton, .change-skeleton {
          background: #1e293b;
          border-radius: 4px;
          height: 16px;
          animation: pulse 2s infinite;
        }
        
        .symbol-skeleton {
          width: 80px;
        }
        
        .price-skeleton {
          width: 70px;
        }
        
        .change-skeleton {
          width: 50px;
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        .dashboard-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #64748b;
          font-size: 14px;
          margin-bottom: 20px;
        }
        
        .data-provider {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .app-footer {
          text-align: center;
          color: #64748b;
          font-size: 13px;
          padding-top: 20px;
          border-top: 1px solid #1e293b;
        }
        
        @media (max-width: 768px) {
          .stock-dashboard {
            padding: 16px;
          }
          
          .dashboard-header {
            flex-direction: column;
          }
          
          .header-actions {
            align-items: flex-start;
            flex-direction: row;
            justify-content: space-between;
            width: 100%;
          }
          
          .stock-table th, 
          .stock-table td {
            padding: 12px 8px;
          }
          
          .symbol-icon {
            width: 32px;
            height: 32px;
            font-size: 12px;
          }
          
          .company-name {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

export default StockTable;