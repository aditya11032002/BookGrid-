import { useState, useEffect } from 'react';
import logger from '../../utils/logger';

const LoggerPanel = () => {
  const [logs, setLogs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [logLevel, setLogLevel] = useState('all');

  useEffect(() => {
    const updateLogs = () => {
      setLogs([...logger.logs]);
    };

    // Initial load
    updateLogs();

    // Update logs every second
    const interval = setInterval(updateLogs, 1000);

    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesFilter = log.action.toLowerCase().includes(filter.toLowerCase()) ||
                         log.data?.item?.title?.toLowerCase().includes(filter.toLowerCase()) ||
                         log.data?.email?.toLowerCase().includes(filter.toLowerCase());
    
    const matchesLevel = logLevel === 'all' || log.level === logLevel;
    
    return matchesFilter && matchesLevel;
  });

  const exportLogs = () => {
    logger.exportLogs();
  };

  const clearLogs = () => {
    logger.clearLogs();
    setLogs([]);
  };

  const getLogSummary = () => {
    return logger.getLogSummary();
  };

  const summary = getLogSummary();

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span className="text-xs">Debug Logs</span>
          <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {summary.errors}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">User State Logger</h2>
          <div className="flex gap-2">
            <button
              onClick={exportLogs}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
            >
              Export
            </button>
            <button
              onClick={clearLogs}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
            >
              Clear
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Logs:</span> {summary.totalLogs}
            </div>
            <div>
              <span className="font-medium">Session:</span> {summary.sessionStart ? new Date(summary.sessionStart).toLocaleTimeString() : 'N/A'}
            </div>
            <div>
              <span className="font-medium">Pages:</span> {Object.keys(summary.pages).length}
            </div>
            <div>
              <span className="font-medium">Errors:</span> 
              <span className={summary.errors > 0 ? 'text-red-600 font-bold' : ''}>
                {summary.errors}
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <input
            type="text"
            placeholder="Filter logs..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={logLevel}
            onChange={(e) => setLogLevel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Levels</option>
            <option value="error">Errors</option>
            <option value="warn">Warnings</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>
        </div>

        {/* Logs */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {filteredLogs.slice(-50).reverse().map((log, index) => (
              <div
                key={index}
                className={`p-3 rounded border-l-4 text-sm ${
                  log.level === 'error' ? 'border-red-500 bg-red-50' :
                  log.level === 'warn' ? 'border-yellow-500 bg-yellow-50' :
                  log.level === 'info' ? 'border-blue-500 bg-blue-50' :
                  'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium">{log.action}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  {JSON.stringify(log.data, null, 2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoggerPanel;
