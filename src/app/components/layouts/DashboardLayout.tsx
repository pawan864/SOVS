import { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { authService } from '../../lib/auth';
import { Button } from '../ui/button';
import { 
  Shield, 
  LogOut, 
  Bell, 
  Settings, 
  Moon, 
  Sun,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  roleLabel: string;
  roleColor?: string;
  showBackButton?: boolean;
  hideProfile?: boolean;
}

export function DashboardLayout({ 
  children, 
  title, 
  subtitle, 
  roleLabel,
  roleColor = "bg-blue-600",
  showBackButton = false,
  hideProfile = false,
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    authService.logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Left: Logo & Title */}
            <div className="flex items-center gap-4">
              {showBackButton && (
                <Button variant="ghost" size="sm" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <div className={`p-2 ${roleColor} rounded-xl shadow-lg`}>
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
                {subtitle && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Right: only shown when hideProfile is FALSE */}
            {!hideProfile && (
              <div className="flex items-center gap-3">

                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="dark:hover:bg-gray-800"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-600" />
                  )}
                </Button>

                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative dark:hover:bg-gray-800">
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </Button>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-3 dark:hover:bg-gray-800">
                      <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.voterId}</p>
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 dark:bg-gray-800 dark:border-gray-700">
                    <div className="px-2 py-2">
                      <p className="text-sm font-semibold dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      <Badge className={`mt-2 ${roleColor}`}>{roleLabel}</Badge>
                    </div>
                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                    <DropdownMenuItem className="dark:hover:bg-gray-700 dark:text-gray-200">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="dark:hover:bg-gray-700 dark:text-gray-200"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

              </div>
            )}
            {/* When hideProfile=true, right side is empty — AdminDashboard renders its own */}

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
