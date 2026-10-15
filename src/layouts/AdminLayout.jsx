import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  CalendarCheck, DollarSign, ClipboardList, Send,
  Bell, Settings, LogOut, Menu, X, ChevronRight, Sun, Moon,
} from 'lucide-react';
import { useAuth }  from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLang }  from '../context/LangContext';
import styles from './Layout.module.css';

const AdminLayout = () => {
  const { user, logout }    = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, changeLang, t } = useLang();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const NAV = [
    { to: '/admin/dashboard',     label: t('dashboard'),     icon: LayoutDashboard },
    { to: '/admin/teachers',      label: t('teachers'),      icon: Users },
    { to: '/admin/students',      label: t('students'),      icon: GraduationCap },
    { to: '/admin/groups',        label: t('groups'),        icon: BookOpen },
    { to: '/admin/attendance',    label: t('attendance'),    icon: CalendarCheck },
    { to: '/admin/salaries',      label: t('salaries'),      icon: DollarSign },
    { to: '/admin/permissions',   label: t('permissions'),   icon: ClipboardList },
    { to: '/admin/telegram',      label: t('telegram'),      icon: Send },
    { to: '/admin/reports',       label: t('reports'),       icon: ChevronRight },
    { to: '/admin/notifications', label: t('notifications'), icon: Bell },
    { to: '/admin/settings',      label: t('settings'),      icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.brand}>
          <img src="/quran-logo.svg" alt="" aria-hidden="true" style={{ width:28, height:28, flexShrink:0 }} />
          <span className={styles.brandName}>QuranClass</span>
          <button className={styles.closeSidebar} onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav} aria-label="Admin navigation">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={() => setSidebarOpen(false)}>
              <Icon size={18} aria-hidden="true" /><span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{user?.fullName?.charAt(0).toUpperCase()}</div>
            <div>
              <div className={styles.userName}>{user?.fullName}</div>
              <div className={styles.userRole}>Administrator</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={16} /> {t('logout')}
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <span className={styles.topbarTitle}>Admin Panel</span>

          <div className={styles.topbarActions}>
            {/* Language selector */}
            <select
              className={styles.langSelect}
              value={lang}
              onChange={e => changeLang(e.target.value)}
              aria-label="Select language"
            >
              <option value="en">English</option>
              <option value="am">አማርኛ</option>
              <option value="or">Afaan Oromo</option>
            </select>

            {/* Theme toggle */}
            <button className={styles.iconBtn} onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
              {theme === 'light' ? t('darkMode') : t('lightMode')}
            </button>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
