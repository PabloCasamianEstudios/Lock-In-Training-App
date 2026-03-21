import React, { useState, useEffect } from 'react';

const SystemStatus = () => {
    const [status, setStatus] = useState({ status: 'OFFLINE', message: 'Connecting to system...' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/system/status');
                const data = await response.json();
                setStatus(data);
            } catch (error) {
                console.error('System connection failed:', error);
                setStatus({ status: 'ERROR', message: 'CRITICAL ERROR: Connection to backend lost.' });
            } finally {
                setLoading(false);
            }
        };

        const timeout = setTimeout(fetchStatus, 1500); // Slight delay for aesthetic effect
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className="system-card min-w-[320px]">
                <div className="flex justify-between items-center mb-4 border-b border-system-blue/30 pb-2">
                    <span className="text-[10px] text-system-blue uppercase tracking-[0.2em]">Status Report</span>
                    <span className={`text-[10px] ${status.status === 'SYSTEM ACTIVE' ? 'text-green-400' : 'text-red-500'}`}>
                        {status.status}
                    </span>
                </div>
                
                <h2 className="text-neon text-2xl font-bold mb-2 tracking-widest text-center">
                    {status.status}
                </h2>
                
                <p className="font-console text-sm text-gray-300 text-center leading-relaxed">
                    {status.message}
                </p>

                <div className="mt-6 h-1 w-full bg-system-blue/10 overflow-hidden">
                    <div className={`h-full bg-system-blue shadow-neon transition-all duration-1000 ${loading ? 'w-1/3 animate-pulse' : 'w-full'}`}></div>
                </div>
            </div>
            
            <div className="text-[10px] text-system-blue/50 uppercase tracking-[0.4em] mt-8 animate-pulse">
                System Interface v1.0.0
            </div>
        </div>
    );
};

export default SystemStatus;
