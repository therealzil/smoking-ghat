import React, { useState, useEffect } from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';
import { auditLogger, AuditLogEntry } from '../services/auditLogger';

export const AuditLedgerViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const entries = await auditLogger.getLog();
      setLogs(entries.reverse()); // Most recent first
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (confirm('Clear all audit logs? This cannot be undone.')) {
      await auditLogger.clearLog();
      setLogs([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-emerald-400 bg-emerald-900/20';
      case 'failed':
        return 'text-red-400 bg-red-900/20';
      case 'retried':
        return 'text-blue-400 bg-blue-900/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-900/20';
      default:
        return 'text-zinc-400 bg-zinc-800';
    }
  };

  return (
    <div className="mt-4 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-800 transition-colors text-zinc-100 font-medium"
      >
        <span>Audit Ledger</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="border-t border-zinc-800 p-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="text-zinc-400 text-sm">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="text-zinc-500 text-sm">No audit logs yet</div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="text-xs p-2 bg-zinc-800 rounded text-zinc-300">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-zinc-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </div>
                      <div className="mt-1 font-medium">{log.action}</div>
                      <div className="text-zinc-400">{log.companyName}</div>
                      {log.details && <div className="mt-1 text-zinc-500">{log.details}</div>}
                      {log.attemptNumber && (
                        <div className="mt-1 text-zinc-500">
                          Attempt {log.attemptNumber} • Next retry in {log.nextRetryDelay}ms
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={handleClearLogs}
                className="mt-3 w-full px-3 py-2 text-xs bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3 h-3" />
                Clear Logs
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
