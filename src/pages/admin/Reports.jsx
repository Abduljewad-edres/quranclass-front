import { useEffect, useState } from 'react';
import api    from '../../services/api';
import useApi from '../../hooks/useApi';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Badge   from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { formatCurrency, formatDate } from '../../utils/helpers';
import styles  from './Page.module.css';

const TABS = ['Teachers','Students','Attendance','Salary'];

const Reports = () => {
  const [tab,   setTab]   = useState('Teachers');
  const today   = new Date();
  const [month, setMonth] = useState(`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`);

  const { data: teacherData,    loading: t1, execute: loadTeachers    } = useApi(() => api.get('/reports/teachers'),          []);
  const { data: studentData,    loading: t2, execute: loadStudents    } = useApi(() => api.get('/reports/students'),          []);
  const { data: attendanceData, loading: t3, execute: loadAttendance  } = useApi(() => api.get('/reports/attendance', { params:{ month } }), []);
  const { data: salaryData,     loading: t4, execute: loadSalary      } = useApi(() => api.get('/reports/salary', { params:{ month } }), []);

  useEffect(() => { loadTeachers(); loadStudents(); }, [loadTeachers, loadStudents]);
  useEffect(() => { loadAttendance(); loadSalary(); }, [loadAttendance, loadSalary, month]);

  const loading = t1 || t2 || t3 || t4;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Reports</h1>
        {(tab === 'Attendance' || tab === 'Salary') && (
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            style={{ padding:'8px 10px', border:'1px solid #d1d5db', borderRadius:8, fontSize:'0.875rem' }} />
        )}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, borderBottom:'2px solid #f1f5f9', marginBottom:4 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding:'8px 18px', border:'none', background:'none', cursor:'pointer', fontWeight: tab===t?700:500,
              color: tab===t?'#2563eb':'#64748b', borderBottom: tab===t?'2px solid #2563eb':'2px solid transparent',
              marginBottom:-2, fontSize:'0.875rem' }}>
            {t}
          </button>
        ))}
      </div>

      <Card>
        <CardBody>
          {loading ? <Spinner /> : (
            <>
              {tab === 'Teachers' && (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead><tr><th>Teacher</th><th>Specialization</th><th>Students</th><th>Groups</th><th>Salary</th><th>Status</th></tr></thead>
                    <tbody>
                      {(teacherData||[]).map((r,i) => (
                        <tr key={i}>
                          <td>{r.full_name}</td><td className={styles.capitalize}>{r.specialization}</td>
                          <td>{r.active_students}</td><td>{r.group_count}</td>
                          <td>{formatCurrency(r.current_month_salary)}</td>
                          <td><Badge status={r.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {tab === 'Students' && (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead><tr><th>Student</th><th>Type</th><th>Teacher</th><th>Group</th><th>Attendance %</th><th>Telegram</th></tr></thead>
                    <tbody>
                      {(studentData||[]).map((r,i) => (
                        <tr key={i}>
                          <td>{r.full_name}</td><td className={styles.capitalize}>{r.learning_type}</td>
                          <td>{r.teacher_name||'—'}</td><td>{r.group_name||'—'}</td>
                          <td>{r.attendance_rate != null ? `${r.attendance_rate}%` : '—'}</td>
                          <td><Badge status={r.telegram_connected?'connected':'not_connected'} label={r.telegram_connected?'Yes':'No'} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {tab === 'Attendance' && (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead><tr><th>Date</th><th>Student</th><th>Teacher</th><th>Group</th><th>Status</th></tr></thead>
                    <tbody>
                      {(attendanceData||[]).map((r,i) => (
                        <tr key={i}>
                          <td>{formatDate(r.attendance_date)}</td><td>{r.student_name}</td>
                          <td>{r.teacher_name}</td><td>{r.group_name||'—'}</td>
                          <td><Badge status={r.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {tab === 'Salary' && (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead><tr><th>Teacher</th><th>Month</th><th>Students</th><th>Rate</th><th>Total</th><th>Status</th><th>Paid</th></tr></thead>
                    <tbody>
                      {(salaryData||[]).map((r,i) => (
                        <tr key={i}>
                          <td>{r.teacher_name}</td><td>{r.salary_month?.slice(0,7)}</td>
                          <td>{r.active_students}</td><td>{formatCurrency(r.rate_per_student)}</td>
                          <td style={{ fontWeight:600 }}>{formatCurrency(r.total_salary)}</td>
                          <td><Badge status={r.status} /></td>
                          <td>{r.payment_date ? formatDate(r.payment_date) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Reports;
