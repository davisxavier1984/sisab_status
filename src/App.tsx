import React, { useEffect, useState, useMemo } from 'react';
import { Activity, CheckCircle2, XCircle, AlertTriangle, Clock, RefreshCw, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO } from 'date-fns';

interface StatusCheck {
  status: 'operational' | 'degraded' | 'down' | 'loading';
  statusCode: number;
  responseTime: number;
  timestamp: string;
}

interface ApiResponse {
  current: StatusCheck;
  history: StatusCheck[];
}

export default function App() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const json: ApiResponse = await response.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Error fetching status:', e);
      // Construct a generic error if the API is completely unreachable
      const errorData: ApiResponse = {
        current: {
          status: 'down',
          statusCode: 0,
          responseTime: 0,
          timestamp: new Date().toISOString()
        },
        history: data?.history || []
      };
      setData(errorData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const overallStatus = data?.current?.status || 'loading';

  const statusConfig = {
    operational: {
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-600',
      lightBg: 'bg-emerald-50 border-emerald-200',
      icon: CheckCircle2,
      label: 'All Systems Operational',
    },
    degraded: {
      color: 'text-amber-600',
      bgColor: 'bg-amber-600',
      lightBg: 'bg-amber-50 border-amber-200',
      icon: AlertTriangle,
      label: 'Partial System Outage',
    },
    down: {
      color: 'text-red-600',
      bgColor: 'bg-red-600',
      lightBg: 'bg-red-50 border-red-200',
      icon: XCircle,
      label: 'Major System Outage',
    },
    loading: {
      color: 'text-slate-400',
      bgColor: 'bg-slate-300',
      lightBg: 'bg-slate-50 border-slate-200',
      icon: Activity,
      label: 'Checking status...',
    },
  };

  const currentConfig = statusConfig[overallStatus];
  const Icon = currentConfig.icon;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#202124] font-sans selection:bg-blue-100">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-[#202124] flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-600" />
              e-SUS AB Status
            </h1>
            <p className="text-slate-500 mt-1 max-w-lg">
              Monitoring <a href="https://esusab.saude.gov.br/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">esusab.saude.gov.br</a> availability.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium whitespace-nowrap">
            {lastUpdated && (
              <>
                <Clock className="w-4 h-4" />
                Updated {format(lastUpdated, 'HH:mm:ss')}
              </>
            )}
            <button
              onClick={() => {
                setLoading(true);
                fetchStatus();
              }}
              className="ml-2 p-1.5 hover:bg-slate-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Refresh status"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        <main className="space-y-8">
          {/* Main Status Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border p-6 sm:p-8 flex items-center gap-4 sm:gap-6 shadow-sm transition-colors duration-500 ${currentConfig.lightBg}`}
          >
            <div className={`p-3 rounded-full bg-white/60 shadow-sm`}>
              <Icon className={`w-10 h-10 ${currentConfig.color}`} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                {currentConfig.label}
              </h2>
              {data?.current && overallStatus !== 'loading' && (
                <p className="mt-1 text-slate-600 font-medium">
                  Response time: <span className="font-mono">{data.current.responseTime}ms</span>
                </p>
              )}
            </div>
          </motion.div>

          {/* History Chart */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">System metrics</h3>
                <p className="text-sm text-slate-500 mt-1">Response time over the last 90 checks</p>
              </div>
              <BarChart2 className="w-5 h-5 text-slate-400" />
            </div>
            
            <div className="h-48 w-full flex items-end gap-1 sm:gap-1.5 mb-2 relative group pt-6">
              {/* Tooltip Overlay (simplified logic) */}
              
              {!data?.history?.length && loading ? (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                  Loading metrics...
                </div>
              ) : (
                data?.history?.map((check, i) => {
                  const isOp = check.status === 'operational';
                  const isDeg = check.status === 'degraded';
                  // Let's cap max height at 1500ms equivalent for display
                  const displayHeight = Math.min(Math.max((check.responseTime / 1500) * 100, 5), 100);
                  
                  let barColor = 'bg-red-400';
                  if (isOp) barColor = 'bg-emerald-400';
                  if (isDeg) barColor = 'bg-amber-400';
                  
                  return (
                    <div 
                      key={i} 
                      className="relative w-full flex-1 flex flex-col justify-end group/bar"
                      style={{ height: '100%' }}
                    >
                      <div 
                        className={`w-full rounded-t-sm transition-all duration-300 opacity-80 hover:opacity-100 ${barColor}`} 
                        style={{ height: `${displayHeight}%` }}
                      />
                      
                      {/* Hover Tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10 hidden group-hover/bar:block pointer-events-none">
                        <div className="bg-slate-800 text-white text-xs py-1.5 px-3 rounded shadow-xl whitespace-nowrap">
                          <p className="font-medium">{format(parseISO(check.timestamp), 'HH:mm:ss')}</p>
                          <p className="text-slate-300">{check.responseTime}ms • {check.statusCode}</p>
                        </div>
                        <div className="w-2 h-2 bg-slate-800 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="flex justify-between items-center text-xs text-slate-400 font-medium border-t border-slate-100 pt-3">
              <span>90 checks ago</span>
              <span>Now</span>
            </div>
          </section>

          {/* Current details table */}
          <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
             <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Services</h3>
             </div>
             <div>
                <div className="flex justify-between items-center px-6 py-5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                     <span className={`w-2.5 h-2.5 rounded-full ${currentConfig.bgColor}`}></span>
                     <span className="font-medium text-slate-900">e-SUS AB Portal</span>
                  </div>
                  <div className="text-sm text-slate-500 font-mono">
                    {data?.current?.statusCode ? `HTTP ${data.current.statusCode}` : '---'}
                  </div>
                </div>
             </div>
          </section>
        </main>
      </div>
    </div>
  );
}

