import { useAuth } from '../hooks/useAuthRedux';
import { useSidebar } from '../hooks/useSidebarRedux';
import { useTheme } from '../hooks/useThemeRedux';

const ReduxTestComponent = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { isExpanded, isMobileOpen } = useSidebar();
  const { theme } = useTheme();

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Redux State Test</h2>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Auth:</strong> {isLoading ? 'Loading...' : isAuthenticated ? `✅ ${user?.name} (${user?.role})` : '❌ Not authenticated'}
        </div>
        
        <div>
          <strong>Sidebar:</strong> {isExpanded ? '📖 Expanded' : '📑 Collapsed'} | Mobile: {isMobileOpen ? '📱 Open' : '📱 Closed'}
        </div>
        
        <div>
          <strong>Theme:</strong> {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
        </div>
      </div>
    </div>
  );
};

export default ReduxTestComponent;