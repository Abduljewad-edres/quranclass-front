import { useEffect } from 'react';
import { Bell } from 'lucide-react';
import api        from '../../services/api';
import useApi     from '../../hooks/useApi';
import { useToast }      from '../../components/ui/Toast';
import Card, { CardBody } from '../../components/ui/Card';
import Button     from '../../components/ui/Button';
import Spinner    from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatDate, getErrorMessage } from '../../utils/helpers';
import tStyles    from './Teacher.module.css';

const Notifications = () => {
  const toast = useToast();
  const { data, loading, execute: load } = useApi(() => api.get('/notifications'), null);

  useEffect(() => { load(); }, [load]);

  const markAll = async () => {
    try {
      await api.patch('/notifications/read-all');
      load();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const notifications = data?.notifications || [];
  const unread        = data?.unreadCount   || 0;

  return (
    <div className={tStyles.page}>
      <div className={tStyles.header}>
        <h1 className={tStyles.title}>
          Notifications {unread > 0 && <span style={{ fontSize:'0.875rem', color:'#2563eb' }}>({unread})</span>}
        </h1>
        {unread > 0 && (
          <Button variant="secondary" size="sm" onClick={markAll}>Mark all read</Button>
        )}
      </div>

      <Card>
        <CardBody>
          {loading ? <Spinner /> : !notifications.length ? (
            <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
              {notifications.map(n => (
                <div key={n.id} style={{
                  padding:'12px 16px',
                  borderRadius:8,
                  background: n.is_read ? '#fff' : '#eff6ff',
                  borderLeft: n.is_read ? '3px solid transparent' : '3px solid #2563eb',
                  marginBottom:4,
                }}>
                  <div style={{ fontWeight:600, fontSize:'0.875rem', color:'#1e293b' }}>{n.title}</div>
                  {n.body && <div style={{ fontSize:'0.8rem', color:'#64748b', marginTop:2 }}>{n.body}</div>}
                  <div style={{ fontSize:'0.75rem', color:'#94a3b8', marginTop:4 }}>{formatDate(n.created_at)}</div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Notifications;
