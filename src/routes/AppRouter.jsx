import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout   from '../layouts/AdminLayout';
import TeacherLayout from '../layouts/TeacherLayout';
import Spinner       from '../components/ui/Spinner';
import { useAuth }   from '../context/AuthContext';

// Auth
const Login = lazy(() => import('../pages/auth/Login'));

// Admin pages
const AdminDashboard    = lazy(() => import('../pages/admin/Dashboard'));
const AdminTeachers     = lazy(() => import('../pages/admin/Teachers'));
const AdminStudents     = lazy(() => import('../pages/admin/Students'));
const AdminGroups       = lazy(() => import('../pages/admin/Groups'));
const AdminAttendance   = lazy(() => import('../pages/admin/Attendance'));
const AdminSalaries     = lazy(() => import('../pages/admin/Salaries'));
const AdminPermissions  = lazy(() => import('../pages/admin/Permissions'));
const AdminTelegram     = lazy(() => import('../pages/admin/Telegram'));
const AdminReports      = lazy(() => import('../pages/admin/Reports'));
const AdminNotifications= lazy(() => import('../pages/admin/Notifications'));
const AdminSettings     = lazy(() => import('../pages/admin/AdminSettings'));

// Teacher pages
const TeacherDashboard    = lazy(() => import('../pages/teacher/Dashboard'));
const TeacherStudents     = lazy(() => import('../pages/teacher/Students'));
const TeacherGroups       = lazy(() => import('../pages/teacher/Groups'));
const TeacherAttendance   = lazy(() => import('../pages/teacher/Attendance'));
const TeacherPermissions  = lazy(() => import('../pages/teacher/Permissions'));
const TeacherTelegram     = lazy(() => import('../pages/teacher/Telegram'));
const TeacherSalary       = lazy(() => import('../pages/teacher/Salary'));
const TeacherNotifications= lazy(() => import('../pages/teacher/Notifications'));
const TeacherProfile      = lazy(() => import('../pages/teacher/Profile'));

const Loading = () => <Spinner size="lg" />;

const AppRouter = () => {
  const { user } = useAuth();

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={
          user
            ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/teacher/dashboard'} replace />
            : <Login />
        } />

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"     element={<AdminDashboard />} />
          <Route path="teachers"      element={<AdminTeachers />} />
          <Route path="students"      element={<AdminStudents />} />
          <Route path="groups"        element={<AdminGroups />} />
          <Route path="attendance"    element={<AdminAttendance />} />
          <Route path="salaries"      element={<AdminSalaries />} />
          <Route path="permissions"   element={<AdminPermissions />} />
          <Route path="telegram"      element={<AdminTelegram />} />
          <Route path="reports"       element={<AdminReports />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="settings"      element={<AdminSettings />} />
        </Route>

        {/* Teacher */}
        <Route path="/teacher" element={
          <ProtectedRoute role="teacher"><TeacherLayout /></ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"     element={<TeacherDashboard />} />
          <Route path="students"      element={<TeacherStudents />} />
          <Route path="groups"        element={<TeacherGroups />} />
          <Route path="attendance"    element={<TeacherAttendance />} />
          <Route path="permissions"   element={<TeacherPermissions />} />
          <Route path="telegram"      element={<TeacherTelegram />} />
          <Route path="salary"        element={<TeacherSalary />} />
          <Route path="notifications" element={<TeacherNotifications />} />
          <Route path="profile"       element={<TeacherProfile />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={
          user
            ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/teacher/dashboard'} replace />
            : <Navigate to="/login" replace />
        } />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
