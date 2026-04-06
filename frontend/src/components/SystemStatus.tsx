import { useState, useEffect, type FC } from 'react';
import type { SystemStatusResponse } from '../types';

const SystemStatus: FC = () => {
    const [status, setStatus] = useState<SystemStatusResponse>({ status: 'OFFLINE', message: 'Connecting to system...' });
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchStatus = async (): Promise<void> => {
            try {
                const response = await fetch('http://localhost:8081/api/system/status');
                const data: SystemStatusResponse = await response.json();
                setStatus(data);
            } catch (error) {
                console.error('System connection failed:', error);
                setStatus({ status: 'ERROR', message: 'CRITICAL ERROR: Connection to backend lost.' });
            } finally {
                setLoading(false);
            }
        };

        const timeout = setTimeout(fetchStatus, 1500);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center space-y-6">
            <div className="system-card min-w-[360px] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-main/20"></div>
                
                <div className="flex justify-between items-center mb-6 pb-2">
                    <span className="text-[9px] text-main font-bold uppercase tracking-[0.3em] opacity-40">[ SYSTEM LINK ]</span>
                    <span className={`text-[9px] font-bold ${status.status === 'SYSTEM ACTIVE' ? 'text-good' : 'text-error animate-pulse'}`}>
                        {status.status}
                    </span>
                </div>
                <div className="divider-main" style={{ marginTop: '-1.5rem', marginBottom: '1.5rem', opacity: 0.5 }} />
                
                <div className="relative mb-6">
                    <h2 className="text-neon text-3xl font-black mb-1 tracking-[0.15em] text-center italic">
                        {status.status}
                    </h2>
                    <div className="flex justify-center gap-1 opacity-50">
                        <div className="h-[2px] w-2 bg-main"></div>
                        <div className="h-[2px] w-8 bg-main"></div>
                        <div className="h-[2px] w-2 bg-main"></div>
                    </div>
                </div>
                
                <p className="font-console text-xs text-text-secondary text-center leading-relaxed tracking-tight px-4 opacity-80">
                    {">"} {status.message}
                </p>

                <div className="mt-8 relative px-4">
                    <div className="absolute -top-3 left-4 text-[8px] text-main font-bold uppercase opacity-30">Initialization Progress</div>
                    <div className="h-[3px] w-full bg-main overflow-hidden" style={{ backgroundColor: 'rgba(var(--main-color-rgb), 0.05)' }}>
                        <div className={`h-full bg-main shadow-[0_0_8px_var(--main-color)] transition-all duration-1000 ${loading ? 'w-1/3 animate-pulse' : 'w-full'}`}></div>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-4 opacity-20">
                <div className="h-[1px] w-12 bg-main"></div>
                <div className="text-[8px] text-main uppercase tracking-[0.5em] whitespace-nowrap">
                    Core Security Protocol Enabled
                </div>
                <div className="h-[1px] w-12 bg-main"></div>
            </div>
        </div>
    );
};

export default SystemStatus;
