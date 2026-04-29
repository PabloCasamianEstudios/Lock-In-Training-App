import { FC } from 'react';
import { Store, Activity } from 'lucide-react';
import BrutalistCard from '../common/BrutalistCard';

interface AdventureStoreProps {
  coins: number;
  onBuyPotion: () => void;
  buying: boolean;
  canBuy: boolean;
}

export const AdventureStore: FC<AdventureStoreProps> = ({ coins, onBuyPotion, buying, canBuy }) => {
  return (
    <BrutalistCard padding="p-6" className="flex flex-col gap-4 border-2 border-border" variant="accent">
      <h2 className="text-text-main font-black text-lg italic uppercase border-b border-border pb-3 flex items-center gap-3 tracking-widest">
        <Store className="w-5 h-5 text-main" /> TIENDA
      </h2>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between border-2 border-border p-3 bg-neutral-black">
          <div className="flex flex-col">
            <span className="text-text-main font-black italic uppercase text-sm">POCIÓN DE VIDA</span>
            <span className="text-main/80 text-[10px] font-black uppercase tracking-widest">+20 HP (AL INSTANTE)</span>
          </div>
          <button
            onClick={onBuyPotion}
            disabled={buying || !canBuy}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-black italic uppercase px-4 py-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center gap-2"
          >
            {buying ? <Activity className="w-4 h-4 animate-spin" /> : '200 ORO'}
          </button>
        </div>
        <div className="text-[10px] text-text-secondary italic font-black uppercase tracking-widest text-right">
          ORO DISPONIBLE: <span className="text-yellow-500">{coins}</span>
        </div>
      </div>
    </BrutalistCard>
  );
};
