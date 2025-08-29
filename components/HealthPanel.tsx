import React, { useState, useEffect } from 'react';
import { SystemHealth, HealthStatus } from '../types';
import { MOCK_HEALTH_STATUS } from '../constants';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';

const StatusIndicator: React.FC<{ status: HealthStatus }> = ({ status }) => {
  const statusConfig = {
    operational: {
      text: 'Operational',
      Icon: CheckCircleIcon,
      color: 'text-green-400',
    },
    degraded: {
      text: 'Degraded',
      Icon: XCircleIcon, // Using X for simplicity, could be a different icon
      color: 'text-yellow-400',
    },
    outage: {
      text: 'Outage',
      Icon: XCircleIcon,
      color: 'text-red-400',
    },
  };
  
  const { text, Icon, color } = statusConfig[status];

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-300 capitalize">{text}</span>
      <Icon className={`h-5 w-5 ${color}`} />
    </div>
  );
};

const HealthPanel: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth>(MOCK_HEALTH_STATUS);
  const [isOpen, setIsOpen] = useState(false);

  // In a real app, you'd use WebSockets or polling to get live updates
  useEffect(() => {
    const interval = setInterval(() => {
        // Mock some status fluctuation for demonstration
        const statuses: HealthStatus[] = ['operational', 'degraded', 'outage'];
        const randomStatus = () => statuses[Math.floor(Math.random() * statuses.length)];
        
        // Make 'operational' more likely
        const weightedRandomStatus = () => (Math.random() < 0.8 ? 'operational' : randomStatus());

        setHealth({
            facebookApi: weightedRandomStatus(),
            webhooks: weightedRandomStatus(),
            messageQueue: weightedRandomStatus(),
            database: 'operational'
        });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const overallStatus = Object.values(health).some(s => s === 'outage') ? 'outage' : 
                        Object.values(health).some(s => s === 'degraded') ? 'degraded' : 
                        'operational';

  const getStatusColor = (status: HealthStatus) => {
    if (status === 'outage') return 'bg-red-500';
    if (status === 'degraded') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div className="mb-2 bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-lg shadow-lg p-4 w-64 text-white">
          <h4 className="font-bold mb-3 text-slate-100">System Health</h4>
          <ul className="space-y-2">
            <li><div className="flex justify-between text-sm"><span className="text-slate-400">Facebook API</span><StatusIndicator status={health.facebookApi} /></div></li>
            <li><div className="flex justify-between text-sm"><span className="text-slate-400">Webhooks</span><StatusIndicator status={health.webhooks} /></div></li>
            <li><div className="flex justify-between text-sm"><span className="text-slate-400">Message Queue</span><StatusIndicator status={health.messageQueue} /></div></li>
            <li><div className="flex justify-between text-sm"><span className="text-slate-400">Database</span><StatusIndicator status={health.database} /></div></li>
          </ul>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center space-x-2 bg-slate-700/80 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg hover:bg-slate-600 transition-colors"
      >
        <div className={`w-3 h-3 rounded-full ${getStatusColor(overallStatus)} animate-pulse`}></div>
        <span className="text-sm font-medium">
          {overallStatus === 'operational' ? 'All Systems Go' : 'System Status'}
        </span>
      </button>
    </div>
  );
};

export default HealthPanel;
