import { useEffect, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import api        from '../../services/api';
import useApi     from '../../hooks/useApi';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Badge      from '../../components/ui/Badge';
import Spinner    from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Select     from '../../components/ui/Select';
import { formatDate } from '../../utils/helpers';
import styles     from './Page.module.css';

const Attendance = () => {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [teacherId, setTeacherId] = useState('');

  const { data: todayData, loading, execute: load }   = useApi(() => api.get('/attendance/today'), null);
  const { data: teachers,  execute: loadTeachers }    = useApi(() => api.get('/teachers'), []);
  const { data: allData,   loading: allLoading, execute: loadAll } = useApi(
    () => api.get('/attendance', { params: { date, teacherId: teacherId || undefined } }), []
  );

  useEffect(() => { load(); loadTeachers(); }, [load, loadTeachers]);
  useEffect(() => { loadAll(); }, [loadAll, date, teacherId]);

  const rows = (allData || []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Attendance</h1>
      </div>

      {/* Today summary cards */}
      {todayData && (
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          {[
            { label:'Date', value: formatDate(todayData.date) },
            { label:'Total', value: todayData.students?.length ?? 0 },
            { label:'Present', value: todayData.students?.filter(s => s.attendance_status === 'present').length ?? 0 },
            { label:'Absent',  value: todayData.students?.filter(s => s.attendance_status === 'absent').length ?? 0 },
          ].map(({ label, value }) => (
            <Card key={label} style={{ flex:'1 1 120px' }}>
              <CardBody>
                <div style={{ fontSize:'1.4rem', fontWeight:700, color:'#1e293b' }}>{value}</div>
                <div style={{ fontSize:'0.8rem', color:'#64748b' }}>{label}</div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Filter + Table */}
      <Card>
        <CardHeader>
          <div className={styles.filtersRow}>
            <div className={styles.filterItem}>
              <label style={{ fontSize:'0.8rem', fontWeight:500, color:'#374151', display:'block', marginBottom:4 }}>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                style={{ padding:'8px 10px', border:'1px solid #d1d5db', borderRadius:8, fontSize:'0.875rem' }} />
            </div>
            <div className={styles.filterItem}>
              <Select label="Teacher" value={teacherId} onChange={e => setTeacherId(e.target.value)}>
                <option value="">All Teachers</option>
                {(teachers || []).map(t => <option key={t.teacher_id} value={t.teacher_id}>{t.full_name}</option>)}
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {allLoading ? <Spinner /> : !rows.length ? (
            <EmptyState icon={CalendarCheck} title="No attendance records" description="No records for the selected filters." />
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr><th>Date</th><th>Student</th><th>Teacher</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.id}>
                      <td>{formatDate(r.attendance_date)}</td>
                      <td>{r.student_name}</td>
                      <td>{r.teacher_name}</td>
                      <td><Badge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Attendance;
