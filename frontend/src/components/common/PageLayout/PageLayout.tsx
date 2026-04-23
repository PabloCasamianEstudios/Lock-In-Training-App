import { type FC, type ReactNode, type ComponentType } from 'react';
import AppHeader from '../AppHeader';

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  icon?: ComponentType<{ className?: string }>;
  headerClassName?: string;
  showStatus?: boolean;
}
const PageLayout: FC<PageLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  icon, 
  headerClassName,
  showStatus = true 
}) => {
  return (
    <div className="hub-page-container">
      <AppHeader 
        title={title} 
        subtitle={subtitle} 
        icon={icon} 
        className={headerClassName}
        showStatus={showStatus}
      />
      <main className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
