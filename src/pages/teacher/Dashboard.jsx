import { useEffect } from 'react';
import { GraduationCap, BookOpen, CalendarCheck, Clock } from 'lucide-react';
import api     from '../../services/api';
import useApi  from '../../hooks/useApi';
import { useAuth }  from '../../context/AuthContext';
import { useLang }  from '../../context/LangContext';
import Card, { CardBody } from '../../components/ui/Card';
import Badge   from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { formatDate } from '../../utils/helpers';
import styles  from './Teacher.module.css';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <Card>
    <CardBody>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ width:44, height:44, borderRadius:10, background: color+'22', color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Icon size={20} />
        </div>
        <div>
          <div style={{ fontSize:'1.4rem', fontWeight:700, color:'var(--text)' }}>{value ?? '—'}</div>
          <div style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{label}</div>
        </div>
      </div>
    </CardBody>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { t }    = useLang();

  const { data: todayData, loading: l1, execute: loadToday }   = useApi(() => api.get('/attendance/today'), null);
  const { data: students,  loading: l2, execute: loadStudents} = useApi(() => api.get('/students'), []);
  const { data: groups,    loading: l3, execute: loadGroups  } = useApi(() => api.get('/groups'), []);

  useEffect(() => { loadToday(); loadStudents(); loadGroups(); }, [loadToday, loadStudents, loadGroups]);

  const present   = (todayData?.students || []).filter(s => s.attendance_status === 'present').length;
  const absent    = (todayData?.students || []).filter(s => s.attendance_status === 'absent').length;
  const permitted = (todayData?.students || []).filter(s => s.attendance_status === 'permitted').length;

  if (l1 || l2 || l3) return <Spinner size="lg" />;

  return (
    <div className={styles.page}>
      <h1 className={styles.welcome}>{t('welcome')}, {user?.fullName?.split(' ')[0]} 👋</h1>

      <div className={styles.statsGrid}>
        <StatCard icon={GraduationCap} label={t('myStudents')} value={(students||[]).length} color="#2563eb" />
        <StatCard icon={BookOpen}      label={t('myGroups')}   value={(groups||[]).length}   color="#7c3aed" />
        <StatCard icon={CalendarCheck} label={t('present')}    value={present}               color="#16a34a" />
        <StatCard icon={Clock}         label={t('absent')}     value={absent}                color="#dc2626" />
        {permitted > 0 && (
          <StatCard icon={Clock}       label={t('permitted')}  value={permitted}             color="#d97706" />
        )}
      </div>

      {/* Today's students */}
      <Card>
        <div style={{ padding:'14px 20px', fontWeight:600, color:'var(--text)', borderBottom:'1px solid var(--border-light)', fontSize:'0.95rem' }}>
          {t('today')} — {formatDate(todayData?.date)}
        </div>
        <CardBody>
          {!(todayData?.students||[]).length ? (
            <p style={{ color:'var(--text-subtle)', fontSize:'0.875rem', margin:0 }}>No students scheduled today.</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {todayData.students.map(s => (
                <div key={s.student_id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border-light)' }}>
                  <span style={{ fontSize:'0.875rem', fontWeight:500, color:'var(--text)' }}>{s.full_name}</span>
                  {s.attendance_status
                    ? <Badge status={s.attendance_status} label={t(s.attendance_status)} />
                    : <span style={{ fontSize:'0.78rem', color:'var(--text-subtle)' }}>Not marked</span>
                  }
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Dashboard;
