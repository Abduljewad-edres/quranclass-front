import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth }  from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import Button  from '../../components/ui/Button';
import Input   from '../../components/ui/Input';
import { getErrorMessage } from '../../utils/helpers';
import styles from './Login.module.css';

const Login = () => {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [form,    setForm]    = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.username, form.password);
      success('Welcome back!');

      const from = location.state?.from?.pathname;
      if (user.mustChangePwd) {
        // Redirect to password change — handled inline for now
      }
      const dest = from || (user.role === 'admin' ? '/admin/dashboard' : '/teacher/dashboard');
      navigate(dest, { replace: true });
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <img src="/quran-logo.svg" alt="QuranClass Logo" className={styles.logo} />
          <h1 className={styles.title}>QuranClass</h1>
          <p className={styles.subtitle}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Input
            id="username"
            label="Username or Email"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
            required
          />
          <Input
            id="password"
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
          <Button type="submit" loading={loading} className={styles.submitBtn}>
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
