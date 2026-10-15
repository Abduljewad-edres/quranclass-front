import { useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import api        from '../../services/api';
import useApi     from '../../hooks/useApi';
import Card, { CardBody } from '../../components/ui/Card';
import Badge      from '../../components/ui/Badge';
import Spinner    from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatDays } from '../../utils/helpers';
import tStyles    from './Teacher.module.css';
import styles     from '../admin/Page.module.css';

const Groups = () => {
  const { data: groups, loading, execute: load } = useApi(() => api.get('/groups'), []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className={tStyles.page}>
      <h1 className={tStyles.title}>My Groups</h1>
      <Card>
        <CardBody>
          {loading ? <Spinner /> : !(groups||[]).length ? (
            <EmptyState icon={BookOpen} title="No groups" />
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {groups.map(g => (
                <Card key={g.id} style={{ border:'1px solid #f1f5f9' }}>
                  <CardBody>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8 }}>
                      <div>
                        <div style={{ fontWeight:700, color:'#1e293b', marginBottom:4 }}>{g.name}</div>
                        <div style={{ fontSize:'0.8rem', color:'#64748b' }}>
                          {g.learning_type} · {formatDays(g.teaching_days)} · {g.teaching_time || '—'}
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:'0.8rem', color:'#64748b' }}>{g.student_count} students</span>
                        <Badge status={g.status} />
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Groups;
