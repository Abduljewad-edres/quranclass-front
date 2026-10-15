import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import api        from '../../services/api';
import useApi     from '../../hooks/useApi';
import { useToast }      from '../../components/ui/Toast';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Button     from '../../components/ui/Button';
import Badge      from '../../components/ui/Badge';
import Spinner    from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Input      from '../../components/ui/Input';
import { getErrorMessage } from '../../utils/helpers';
import tStyles    from './Teacher.module.css';
import styles     from '../admin/Page.module.css';

const Telegram = () => {
  const toast = useToast();
  const { data: students, loading, execute: load } = useApi(() => api.get('/telegram/status'), []);
  const [zoomLink,  setZoomLink]  = useState('');
  const [selected,  setSelected]  = useState([]);
  const [sending,   setSending]   = useState(false);

  useEffect(() => { load(); }, [load]);

  const connected = (students || []).filter(s => s.connected);

  const toggleSelect = (id) =>
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const selectAll = () =>
    setSelected(connected.map(s => s.student_id));

  const clearAll = () => setSelected([]);

  const handleSend = async () => {
    if (!zoomLink.trim()) { toast.warning('Please enter a Zoom link'); return; }
    if (!selected.length) { toast.warning('Select at least one student'); return; }
    setSending(true);
    try {
      const res = await api.post('/telegram/send-bulk', {
        studentIds: selected,
        zoomLink: zoomLink.trim(),
      });
      const results  = res.data.data.results || [];
      const sentCnt  = results.filter(r => r.status === 'sent').length;
      const failCnt  = results.filter(r => r.status === 'failed').length;
      toast.success(`Sent: ${sentCnt}${failCnt ? `, Failed: ${failCnt}` : ''}`);
      setSelected([]);
      setZoomLink('');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setSending(false); }
  };

  return (
    <div className={tStyles.page}>
      <div className={tStyles.header}>
        <h1 className={tStyles.title}>Send Zoom Link</h1>
      </div>

      {/* Zoom Link input */}
      <Card>
        <CardBody>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'flex-end' }}>
            <div style={{ flex:1, minWidth:240 }}>
              <Input
                label="Zoom Meeting Link"
                value={zoomLink}
                onChange={e => setZoomLink(e.target.value)}
                placeholder="https://zoom.us/j/..."
                type="url"
              />
            </div>
            <div style={{ display:'flex', gap:6, alignItems:'center', paddingBottom:1 }}>
              <Button size="sm" variant="secondary" onClick={selectAll} disabled={!connected.length}>
                Select All
              </Button>
              <Button size="sm" variant="secondary" onClick={clearAll} disabled={!selected.length}>
                Clear
              </Button>
              <Button onClick={handleSend} loading={sending} disabled={!selected.length || !zoomLink.trim()}>
                <Send size={15} /> Send to {selected.length || '…'}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Student list */}
      <Card>
        <CardHeader>
          Students ({(students||[]).length}) —{' '}
          <span style={{ color:'#16a34a' }}>{connected.length} connected</span>
        </CardHeader>
        <CardBody>
          {loading ? <Spinner /> : !(students||[]).length ? (
            <EmptyState icon={Send} title="No students" />
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {students.map(s => (
                  <div key={s.student_id}
                  onClick={() => s.connected && toggleSelect(s.student_id)}
                  style={{
                    display:'flex', alignItems:'center', gap:12,
                    padding:'10px 12px', borderRadius:8,
                    border: selected.includes(s.student_id) ? '1px solid #2563eb' : '1px solid #f1f5f9',
                    background: selected.includes(s.student_id) ? '#eff6ff' : '#fff',
                    cursor: s.connected ? 'pointer' : 'default',
                    opacity: s.connected ? 1 : 0.6,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(s.student_id)}
                    onChange={() => toggleSelect(s.student_id)}
                    disabled={!s.connected}
                    onClick={e => e.stopPropagation()}
                    aria-label={`Select ${s.full_name}`}
                  />
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:'0.875rem', color:'#1e293b' }}>{s.full_name}</div>
                    {s.telegram_username && (
                      <div style={{ fontSize:'0.78rem', color:'#64748b' }}>@{s.telegram_username}</div>
                    )}
                    {!s.telegram_username && (
                      <div style={{ fontSize:'0.78rem', color:'#f59e0b' }}>No Telegram username registered</div>
                    )}
                  </div>
                  <Badge
                    status={s.connected ? 'connected' : 'not_connected'}
                    label={s.connected ? 'Connected' : s.telegram_username ? 'Not connected yet' : 'No username'}
                  />
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Telegram;
