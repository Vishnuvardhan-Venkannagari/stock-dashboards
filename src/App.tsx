
import React from "react";
import StockTable from "./components/StockTable";

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-gray-900 to-gray-800 text-white py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Stock Dashboard
        </h1>
      </div>
      <StockTable />
      <footer className="mt-8 text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Stock Dashboard. All data is for demonstration purposes only.</p>
      </footer>
    </div>
  );
};

export default App;