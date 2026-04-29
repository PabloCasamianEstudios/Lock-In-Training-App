import { useState, type FC } from 'react';
import { Database } from 'lucide-react';
import PopupWindow from '../../components/common/PopupWindow';
import PageLayout from '../../components/common/PageLayout';
import { adminService } from '../../services/adminService';
import {
  AdminSidebar,
  AdminEntityHeader,
  AdminQuickView,
  AdminEndpointList
} from '../../components/admin';

const AdminPage: FC = () => {
  const [selectedEntity, setSelectedEntity] = useState<string>('users');
  const [globalData, setGlobalData] = useState<any[]>([]);
  const [systemPopup, setSystemPopup] = useState<{ 
    isOpen: boolean; 
    title: string; 
    message: string; 
    type: 'INFO' | 'DANGER'; 
    onConfirm?: () => void 
  } | null>(null);

  const closePopup = () => setSystemPopup(null);

  const handleDeleteQuick = async (id: number): Promise<void> => {
    setSystemPopup({
      isOpen: true,
      title: 'CONFIRM DELETION',
      message: `ARE YOU SURE YOU WANT TO DELETE RECORD #${id} FROM ${selectedEntity.toUpperCase()}? THIS ACTION IS IRREVERSIBLE.`,
      type: 'DANGER',
      onConfirm: () => performDelete(id)
    });
  };

  const performDelete = async (id: number): Promise<void> => {
    try {
      await adminService.deleteRecord(selectedEntity, id);
      setSystemPopup({
        isOpen: true,
        title: 'PURGE COMPLETE',
        message: 'THE RECORD HAS BEEN PERMANENTLY REMOVED FROM THE DATABASE.',
        type: 'INFO'
      });
    } catch (error: any) {
      console.error('Error deleting record:', error);
      setSystemPopup({
        isOpen: true,
        title: 'PROTOCOL ERROR',
        message: error.message || 'UNABLE TO COMMUNICATE WITH THE CORE SYSTEM.',
        type: 'DANGER'
      });
    }
  };

  return (
    <PageLayout 
      title="ADMIN PANEL" 
      subtitle="CENTRAL CORE OVERRIDE" 
      icon={Database}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mt-8">
        {/* SIDEBAR */}
        <AdminSidebar 
          selectedEntity={selectedEntity} 
          onSelectEntity={(id) => { 
            setSelectedEntity(id); 
            setGlobalData([]); 
          }} 
        />

        {/* MAIN CONTENT */}
        <div className="lg:col-span-3">
          <AdminEntityHeader entity={selectedEntity} />

          <AdminEndpointList 
            selectedEntity={selectedEntity} 
            setGlobalData={setGlobalData} 
          />

          <AdminQuickView 
            entity={selectedEntity} 
            data={globalData} 
            onDelete={handleDeleteQuick} 
          />
        </div>
      </div>

      <PopupWindow
        isOpen={!!systemPopup?.isOpen}
        onClose={closePopup}
        title={systemPopup?.title}
        maxWidth="max-w-sm"
      >
        <div className="flex flex-col items-center text-center space-y-8 pt-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            systemPopup?.type === 'DANGER' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
          }`}>
            <Database className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-black uppercase italic tracking-widest text-text-main">
              {systemPopup?.title}
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed font-mono opacity-60">
              {systemPopup?.message}
            </p>
          </div>

          <div className="flex gap-4 w-full">
            {systemPopup?.onConfirm ? (
              <>
                <button
                  onClick={closePopup}
                  className="flex-1 py-3 border-2 border-border text-text-secondary font-black uppercase italic text-[10px] hover:bg-surface transition-all"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => {
                    systemPopup.onConfirm?.();
                    closePopup();
                  }}
                  className="flex-1 py-3 bg-red-600 text-neutral-black font-black uppercase italic text-[10px] hover:bg-red-500 transition-all shadow-[4px_4px_0_var(--neutral-white)]"
                >
                  CONFIRM PURGE
                </button>
              </>
            ) : (
              <button
                onClick={closePopup}
                className="w-full py-3 bg-orange-500 text-neutral-black font-black uppercase italic text-[10px] hover:bg-orange-400 transition-all"
              >
                ACKNOWLEDGE
              </button>
            )}
          </div>
        </div>
      </PopupWindow>
    </PageLayout>
  );
};

export default AdminPage;
