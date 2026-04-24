import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/advisory', label: 'Advisory', icon: '🌾' },
    { to: '/marketplace', label: 'Marketplace', icon: '🏪' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? '/dashboard' : '/login'} className="flex items-center gap-2 group">
            <span className="text-2xl">🌱</span>
            <span className="text-xl font-bold gradient-text group-hover:opacity-80 transition-opacity">
              AgriSmart
            </span>
          </Link>

          {/* Nav Links */}
          {isAuthenticated && (
            <div className="hidden sm:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive(link.to)
                      ? 'bg-primary-500/20 text-primary-300 shadow-sm shadow-primary-500/10'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                    }`}
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-gray-300">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm text-gray-400 hover:text-gray-200 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
                  Login
                </Link>
                <Link to="/register" className="btn-primary !py-2 !px-4 text-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        {isAuthenticated && (
          <div className="sm:hidden flex items-center gap-1 pb-3 overflow-x-auto">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all
                  ${isActive(link.to)
                    ? 'bg-primary-500/20 text-primary-300'
                    : 'text-gray-400 hover:text-gray-200'
                  }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
