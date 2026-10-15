import { useEffect, useState } from 'react';
import { Bell, Send } from 'lucide-react';
import api        from '../../services/api';
import useApi     from '../../hooks/useApi';
import { useToast }      from '../../components/ui/Toast';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Button     from '../../components/ui/Button';
import Modal      from '../../components/ui/Modal';
import Input      from '../../components/ui/Input';
import Select     from '../../components/ui/Select';
import Spinner    from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatDate, getErrorMessage } from '../../utils/helpers';
import styles     from './Page.module.css';

const Notifications = () => {
  const toast = useToast();
  const { data, loading, execute: load }      = useApi(() => api.get('/notifications'), null);
  const { data: teachers, execute: loadTeachers } = useApi(() => api.get('/teachers'), []);

  const [modal,   setModal]   = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState({ title: '', body: '', targetId: 'all' });

  useEffect(() => { load(); loadTeachers(); }, [load, loadTeachers]);

  const markAll = async () => {
    try {
      await api.patch('/notifications/read-all');
      load();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const targets = form.targetId === 'all'
        ? (teachers || []).map(t => t.id)
        : [parseInt(form.targetId)];

      // Send a notification to each selected teacher user
      await Promise.all(targets.map(userId =>
        api.post('/notifications/send', {
          userId,
          title: form.title,
          body:  form.body,
        })
      ));

      toast.success('Announcement sent');
      setModal(false);
      setForm({ title: '', body: '', targetId: 'all' });
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setSaving(false); }
  };

  const notifications = data?.notifications || [];
  const unread        = data?.unreadCount   || 0;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Notifications {unread > 0 && <span style={{ fontSize:'0.875rem', color:'#2563eb' }}>({unread} unread)</span>}
        </h1>
        <div style={{ display:'flex', gap:8 }}>
          {unread > 0 && <Button variant="secondary" size="sm" onClick={markAll}>Mark all read</Button>}
          <Button size="sm" onClick={() => setModal(true)}>
            <Send size={14} /> Send Announcement
          </Button>
        </div>
      </div>

      <Card>
        <CardBody>
          {loading ? <Spinner /> : !notifications.length ? (
            <EmptyState icon={Bell} title="No notifications" description="Send an announcement to notify teachers." />
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {notifications.map(n => (
                <div key={n.id} style={{
                  padding:'12px 16px', borderRadius:8,
                  background: n.is_read ? '#fff' : '#eff6ff',
                  borderLeft: n.is_read ? '3px solid transparent' : '3px solid #2563eb',
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

      {/* Send Announcement Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Send Announcement" size="md">
        <form onSubmit={handleSend} className={styles.form}>
          <Select label="Send To" value={form.targetId} onChange={e => setForm(p => ({ ...p, targetId: e.target.value }))}>
            <option value="all">All Teachers</option>
            {(teachers || []).map(t => (
              <option key={t.id} value={t.id}>{t.full_name}</option>
            ))}
          </Select>
          <Input
            label="Title"
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Schedule change this Friday"
            required
          />
          <div>
            <label style={{ fontSize:'0.875rem', fontWeight:500, color:'#374151', display:'block', marginBottom:4 }}>
              Message (optional)
            </label>
            <textarea
              value={form.body}
              onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
              placeholder="Additional details…"
              style={{ width:'100%', padding:'9px 12px', border:'1px solid #d1d5db', borderRadius:8, fontSize:'0.9rem', minHeight:80, resize:'vertical', boxSizing:'border-box' }}
            />
          </div>
          <div className={styles.formActions}>
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}><Send size={14} /> Send</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Notifications;
