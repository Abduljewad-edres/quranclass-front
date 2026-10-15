import { useEffect } from 'react';
import { Users, GraduationCap, BookOpen, CalendarCheck, Clock, DollarSign } from 'lucide-react';
import api     from '../../services/api';
import useApi  from '../../hooks/useApi';
import { useLang }   from '../../context/LangContext';
import Card, { CardBody } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { formatCurrency } from '../../utils/helpers';
import styles from './Dashboard.module.css';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <Card className={styles.stat}>
    <CardBody>
      <div className={styles.statIcon} style={{ background: color + '22', color }}>
        <Icon size={22} aria-hidden="true" />
      </div>
      <div>
        <div className={styles.statValue}>{value ?? '—'}</div>
        <div className={styles.statLabel}>{label}</div>
      </div>
    </CardBody>
  </Card>
);

const Dashboard = () => {
  const { t } = useLang();
  const { data, loading, execute } = useApi(() => api.get('/reports/dashboard'), null);

  useEffect(() => { execute(); }, [execute]);

  if (loading) return <Spinner size="lg" />;

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>{t('dashboard')}</h1>

      <div className={styles.grid}>
        <StatCard icon={Users}         label={t('totalTeachers')}      value={data?.totalTeachers}      color="#2563eb" />
        <StatCard icon={GraduationCap} label={t('totalStudents')}      value={data?.totalStudents}      color="#059669" />
        <StatCard icon={BookOpen}      label={t('activeGroups')}       value={data?.activeGroups}       color="#7c3aed" />
        <StatCard icon={CalendarCheck} label={t('presentToday')}       value={data?.presentToday}       color="#16a34a" />
        <StatCard icon={Clock}         label={t('absentToday')}        value={data?.absentToday}        color="#dc2626" />
        <StatCard icon={Clock}         label={t('pendingPermissions')} value={data?.pendingPermissions} color="#d97706" />
        <StatCard icon={DollarSign}    label={t('pendingSalary')}      value={data ? formatCurrency(data.pendingSalary) : '—'} color="#0891b2" />
      </div>
    </div>
  );
};

export default Dashboard;
