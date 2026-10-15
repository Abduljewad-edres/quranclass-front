import { useEffect, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import api        from '../../services/api';
import useApi     from '../../hooks/useApi';
import { useToast }      from '../../components/ui/Toast';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Button     from '../../components/ui/Button';
import Badge      from '../../components/ui/Badge';
import Spinner    from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatDate, getErrorMessage } from '../../utils/helpers';
import tStyles    from './Teacher.module.css';
import styles     from '../admin/Page.module.css';

// Mark button config
const MARK_BTNS = [
  { status:'present',   label:'Present',   bg:'#dcfce7', color:'#166534', border:'#16a34a' },
  { status:'absent',    label:'Absent',    bg:'#fee2e2', color:'#991b1b', border:'#dc2626' },
  { status:'permitted', label:'Permitted', bg:'#fef9c3', color:'#854d0e', border:'#d97706' },
];

const Attendance = () => {
  const toast = useToast();
  const today = new Date().toISOString().slice(0, 10);

  const { data: todayData, loading, execute: load } = useApi(() => api.get('/attendance/today'), null);
  const [marks,  setMarks]  = useState({});
  const [saving, setSaving] = useState(false);
  const [view,   setView]   = useState('today');

  const { data: history, loading: histLoading, execute: loadHistory } = useApi(
    () => api.get('/attendance/history'), []
  );

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (view === 'history') loadHistory(); }, [view, loadHistory]);

  // Pre-fill existing marks
  useEffect(() => {
    if (todayData?.students) {
      const existing = {};
      todayData.students.forEach(s => {
        if (s.attendance_status) existing[s.student_id] = s.attendance_status;
      });
      setMarks(existing);
    }
  }, [todayData]);

  const handleMark = (studentId, status) =>
    setMarks(p => ({ ...p, [studentId]: status }));

  const handleSubmit = async () => {
    const records = (todayData?.students || []).map(s => ({
      studentId: s.student_id,
      status:    marks[s.student_id] || 'absent',
    }));
    setSaving(true);
    try {
      await api.post('/attendance', { records, attendanceDate: today });
      toast.success('Attendance submitted');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setSaving(false); }
  };

  // Summary counts
  const presentCount  = Object.values(marks).filter(s => s === 'present').length;
  const absentCount   = Object.values(marks).filter(s => s === 'absent').length;
  const permittedCount= Object.values(marks).filter(s => s === 'permitted').length;

  return (
    <div className={tStyles.page}>
      <div className={tStyles.header}>
        <h1 className={tStyles.title}>Attendance</h1>
        <div style={{ display:'flex', gap:6 }}>
          <Button size="sm" variant={view==='today'   ? 'primary':'secondary'} onClick={() => setView('today')}>Today</Button>
          <Button size="sm" variant={view==='history' ? 'primary':'secondary'} onClick={() => setView('history')}>History</Button>
        </div>
      </div>

      {view === 'today' && (
        <Card>
          <CardHeader>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
              <span>{formatDate(today)} — Mark Attendance</span>
              {/* Live summary */}
              <div style={{ display:'flex', gap:10, fontSize:'0.8rem' }}>
                <span style={{ color:'#16a34a', fontWeight:600 }}>✓ {presentCount} Present</span>
                <span style={{ color:'#dc2626', fontWeight:600 }}>✗ {absentCount} Absent</span>
                <span style={{ color:'#d97706', fontWeight:600 }}>⏸ {permittedCount} Permitted</span>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            {loading ? <Spinner /> : !(todayData?.students||[]).length ? (
              <EmptyState icon={CalendarCheck} title="No students today" description="No students are assigned to you yet." />
            ) : (
              <>
                <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
                  {todayData.students.map(s => {
                    const current = marks[s.student_id];
                    return (
                      <div key={s.student_id} style={{
                        display:'flex', alignItems:'center', justifyContent:'space-between',
                        padding:'10px 12px', borderRadius:8,
                        background: current === 'present' ? '#f0fdf4' : current === 'permitted' ? '#fffbeb' : current === 'absent' ? '#fef2f2' : '#f8fafc',
                        border: '1px solid',
                        borderColor: current === 'present' ? '#bbf7d0' : current === 'permitted' ? '#fde68a' : current === 'absent' ? '#fecaca' : '#f1f5f9',
                        flexWrap:'wrap', gap:8,
                      }}>
                        <span style={{ fontWeight:500, color:'#1e293b', fontSize:'0.9rem' }}>{s.full_name}</span>
                        <div style={{ display:'flex', gap:6 }}>
                          {MARK_BTNS.map(btn => (
                            <button
                              key={btn.status}
                              type="button"
                              onClick={() => handleMark(s.student_id, btn.status)}
                              style={{
                                padding:'5px 12px', borderRadius:6, border:'1px solid', fontSize:'0.8rem',
                                cursor:'pointer', fontWeight:600, transition:'all 0.1s',
                                background: current === btn.status ? btn.bg    : '#fff',
                                color:      current === btn.status ? btn.color : '#64748b',
                                borderColor:current === btn.status ? btn.border: '#d1d5db',
                              }}
                            >
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button onClick={handleSubmit} loading={saving}>Submit Attendance</Button>
              </>
            )}
          </CardBody>
        </Card>
      )}

      {view === 'history' && (
        <Card>
          <CardBody>
            {histLoading ? <Spinner /> : !(history||[]).length ? (
              <EmptyState icon={CalendarCheck} title="No history yet" />
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr><th>Student</th><th>Present</th><th>Absent</th><th>Permitted</th><th>Total</th><th>Rate</th></tr>
                  </thead>
                  <tbody>
                    {history.map(r => (
                      <tr key={r.student_id}>
                        <td>{r.full_name}</td>
                        <td style={{ color:'#16a34a', fontWeight:600 }}>{r.present_count}</td>
                        <td style={{ color:'#dc2626', fontWeight:600 }}>{r.absent_count}</td>
                        <td style={{ color:'#d97706', fontWeight:600 }}>{r.permitted_count ?? 0}</td>
                        <td>{r.total_sessions}</td>
                        <td>{r.attendance_rate != null ? `${r.attendance_rate}%` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default Attendance;
