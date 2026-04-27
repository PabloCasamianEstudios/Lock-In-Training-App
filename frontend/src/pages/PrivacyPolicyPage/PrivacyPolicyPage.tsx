import { type FC } from 'react';
import { Shield, ChevronLeft, Lock, Eye, FileText, Database } from 'lucide-react';
import PageLayout from '../../components/common/PageLayout';
import BrutalistCard from '../../components/common/BrutalistCard';

interface PrivacyPolicyPageProps {
  onNavigate?: (tab: string) => void;
}

const PrivacyPolicyPage: FC<PrivacyPolicyPageProps> = ({ onNavigate }) => {
  return (
    <PageLayout 
      title="PRIVACY PROTOCOL" 
      subtitle="DATA PROTECTION AND SECURITY CLEARANCE" 
      icon={Shield}
    >
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        <button 
          onClick={() => onNavigate?.('profile')}
          className="flex items-center gap-2 text-main font-black uppercase italic tracking-widest hover:translate-x-1 transition-transform mb-8"
        >
          <ChevronLeft className="w-5 h-5" />
          RETURN TO SYSTEM
        </button>

        <BrutalistCard padding="p-10" className="space-y-10 border-4 border-white shadow-[16px_16px_0px_var(--main-color)]">
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-main">
              <Lock className="w-6 h-6" />
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">01. DATA COLLECTION</h2>
            </div>
            <div className="text-white/60 leading-relaxed font-medium space-y-4">
              <p>
                LOCK-IN operates under a strict data minimization protocol. We only collect the essential information required to maintain your hunter status and synchronize your progression across the system.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-white/80">
                <li><span className="text-main font-bold italic">Email Address:</span> Used exclusively for account identification, password recovery, and critical system alerts.</li>
                <li><span className="text-main font-bold italic">Birth Date:</span> Required for age verification and level-gating protocols to ensure safety within the Coliseo.</li>
              </ul>
            </div>
          </section>

          <div className="h-1 bg-white/10 w-full" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-main">
              <Eye className="w-6 h-6" />
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">02. DATA USAGE</h2>
            </div>
            <p className="text-white/60 leading-relaxed font-medium">
              Your data is processed locally whenever possible. We do not sell, trade, or transfer your personal information to outside parties. All training metrics, quest progress, and ranking information are used internally to generate global leaderboards and provide personalized quest recommendations.
            </p>
            <p className="text-white/60 leading-relaxed font-medium">
              System administrators monitor total points and level progression for anti-cheat purposes and to ensure the integrity of the Diamond League.
            </p>
          </section>

          <div className="h-1 bg-white/10 w-full" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-main">
              <Database className="w-6 h-6" />
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">03. SECURITY CLEARANCE</h2>
            </div>
            <p className="text-white/60 leading-relaxed font-medium">
              We implement a variety of security measures to maintain the safety of your personal information. We use state-of-the-art encryption for data at rest and in transit. Your password is never stored in plain text; it is hashed using industry-standard BCrypt algorithms.
            </p>
            <div className="bg-main/5 border-l-4 border-main p-6 italic">
              <p className="text-white/80 text-sm leading-relaxed">
                "The strength of a hunter lies not only in their physical power, but in the security of their mind and data. LOCK-IN protects both with equal priority."
              </p>
            </div>
          </section>

          <div className="h-1 bg-white/10 w-full" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-main">
              <FileText className="w-6 h-6" />
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">04. USER RIGHTS</h2>
            </div>
            <p className="text-white/60 leading-relaxed font-medium">
              You have the right to request a full dump of your data or the permanent deletion of your hunter profile at any time. To exercise these rights, please contact the system administrators through the official channels.
            </p>
            <p className="text-xs text-white/20 uppercase tracking-[0.2em] pt-8">
              LOCK-IN PRIVACY PROTOCOL v2.4.0 - LAST UPDATED: 2026.04.27
            </p>
          </section>
        </BrutalistCard>
      </div>
    </PageLayout>
  );
};

export default PrivacyPolicyPage;
