import { useEffect, useState } from 'react';
import { Search, GraduationCap } from 'lucide-react';
import api        from '../../services/api';
import useApi     from '../../hooks/useApi';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Badge      from '../../components/ui/Badge';
import Spinner    from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatDays } from '../../utils/helpers';
import styles     from '../admin/Page.module.css';
import tStyles    from './Teacher.module.css';

const Students = () => {
  const { data: students, loading, execute: load } = useApi(() => api.get('/students'), []);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, [load]);

  const filtered = (students||[]).filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={tStyles.page}>
      <div className={tStyles.header}>
        <h1 className={tStyles.title}>My Students</h1>
      </div>

      <Card>
        <CardHeader>
          <div className={styles.searchRow}>
            <Search size={16} className={styles.searchIcon} />
            <input className={styles.searchInput} placeholder="Search students…" value={search} onChange={e => setSearch(e.target.value)} aria-label="Search" />
          </div>
        </CardHeader>
        <CardBody>
          {loading ? <Spinner /> : !filtered.length ? (
            <EmptyState icon={GraduationCap} title="No students assigned" description="The administrator will assign students to you." />
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr><th>Name</th><th>Learning Type</th><th>Group</th><th>Days</th><th>Telegram</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id}>
                      <td>{s.full_name}</td>
                      <td className={styles.capitalize}>{s.learning_type}</td>
                      <td>{s.group_name || <span className={styles.muted}>—</span>}</td>
                      <td>{formatDays(s.teaching_days) || '—'}</td>
                      <td><Badge status={s.telegram_connected ? 'connected' : 'not_connected'} label={s.telegram_connected ? 'Connected' : 'No'} /></td>
                      <td><Badge status={s.status} /></td>
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

export default Students;
