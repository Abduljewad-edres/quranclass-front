import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, GraduationCap, BookOpen,
  CalendarCheck, ClipboardList, Send, DollarSign,
  Bell, UserCircle, LogOut, Menu, X, Sun, Moon,
} from 'lucide-react';
import { useAuth }  from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLang }  from '../context/LangContext';
import styles from './Layout.module.css';

const BOTTOM_TABS_KEYS = [
  { to: '/teacher/dashboard',   labelKey:'dashboard',   icon: LayoutDashboard },
  { to: '/teacher/students',    labelKey:'students',    icon: GraduationCap },
  { to: '/teacher/attendance',  labelKey:'attendance',  icon: CalendarCheck },
  { to: '/teacher/permissions', labelKey:'permissions', icon: ClipboardList },
  { to: '/teacher/salary',      labelKey:'salary',      icon: DollarSign },
];

const TeacherLayout = () => {
  const { user, logout }       = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, changeLang, t }= useLang();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const NAV = [
    { to: '/teacher/dashboard',     labelKey:'dashboard' },
    { to: '/teacher/students',      labelKey:'students' },
    { to: '/teacher/groups',        labelKey:'groups' },
    { to: '/teacher/attendance',    labelKey:'attendance' },
    { to: '/teacher/permissions',   labelKey:'permissions' },
    { to: '/teacher/telegram',      labelKey:'telegram' },
    { to: '/teacher/salary',        labelKey:'salary' },
    { to: '/teacher/notifications', labelKey:'notifications' },
    { to: '/teacher/profile',       labelKey:'profile' },
  ];

  const ICONS = {
    dashboard: LayoutDashboard, students: GraduationCap, groups: BookOpen,
    attendance: CalendarCheck, permissions: ClipboardList, telegram: Send,
    salary: DollarSign, notifications: Bell, profile: UserCircle,
  };

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

        <nav className={styles.nav} aria-label="Teacher navigation">
          {NAV.map(({ to, labelKey }) => {
            const Icon = ICONS[labelKey] || LayoutDashboard;
            return (
              <NavLink key={to} to={to}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={() => setSidebarOpen(false)}>
                <Icon size={18} aria-hidden="true" /><span>{t(labelKey)}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{user?.fullName?.charAt(0).toUpperCase()}</div>
            <div>
              <div className={styles.userName}>{user?.fullName}</div>
              <div className={styles.userRole}>Teacher</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={16} /> {t('logout')}
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      <div className={`${styles.main} ${styles.withBottomNav}`}>
        <header className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <span className={styles.topbarTitle}>
            {t('welcome')}, {user?.fullName?.split(' ')[0]}
          </span>

          <div className={styles.topbarActions}>
            <select className={styles.langSelect} value={lang} onChange={e => changeLang(e.target.value)} aria-label="Select language">
              <option value="en">English</option>
              <option value="am">አማርኛ</option>
              <option value="or">Afaan Oromo</option>
            </select>
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

      <nav className={styles.bottomNav} aria-label="Mobile navigation">
        {BOTTOM_TABS_KEYS.map(({ to, labelKey, icon: Icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `${styles.bottomTab} ${isActive ? styles.active : ''}`}>
            <Icon size={20} aria-hidden="true" />
            <span>{t(labelKey)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default TeacherLayout;
