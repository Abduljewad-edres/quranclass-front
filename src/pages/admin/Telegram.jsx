import { useEffect, useState } from 'react';
import { Send, Link } from 'lucide-react';
import api        from '../../services/api';
import useApi     from '../../hooks/useApi';
import { useToast }      from '../../components/ui/Toast';
import Card, { CardBody } from '../../components/ui/Card';
import Button     from '../../components/ui/Button';
import Badge      from '../../components/ui/Badge';
import Spinner    from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal      from '../../components/ui/Modal';
import Input      from '../../components/ui/Input';
import { formatDate, getErrorMessage } from '../../utils/helpers';
import styles     from './Page.module.css';

const Telegram = () => {
  const toast = useToast();
  const { data: students, loading, execute: load } = useApi(() => api.get('/telegram/status'), []);
  const [connectModal, setConnectModal] = useState(null); // student object
  const [chatId,       setChatId]       = useState('');
  const [tgUsername,   setTgUsername]   = useState('');
  const [saving,       setSaving]       = useState(false);

  useEffect(() => { load(); }, [load]);

  const connected    = (students||[]).filter(s => s.connected);
  const notConnected = (students||[]).filter(s => !s.connected);

  const openConnect = (student) => {
    setConnectModal(student);
    setChatId('');
    setTgUsername(student.telegram_username || '');
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!chatId.trim()) { toast.error('Please enter the Telegram Chat ID'); return; }
    setSaving(true);
    try {
      await api.post('/telegram/connect', {
        studentId:       connectModal.student_id,
        chatId:          chatId.trim(),
        telegramUsername: tgUsername.replace(/^@/, '') || null,
      });
      toast.success(`${connectModal.full_name} connected`);
      setConnectModal(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setSaving(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Telegram Connections</h1>
        <div style={{ display:'flex', gap:12 }}>
          <span style={{ fontSize:'0.875rem', color:'#16a34a', fontWeight:600 }}>✓ {connected.length} Connected</span>
          <span style={{ fontSize:'0.875rem', color:'#94a3b8', fontWeight:600 }}>✗ {notConnected.length} Not connected</span>
        </div>
      </div>

      {/* How to get Chat ID instructions */}
      <Card style={{ background:'#fffbeb', border:'1px solid #fde68a' }}>
        <CardBody>
          <div style={{ fontSize:'0.875rem', color:'#92400e' }}>
            <strong>How to connect a student:</strong>
            <ol style={{ margin:'8px 0 0 16px', lineHeight:1.8 }}>
              <li>Student opens Telegram and searches for your bot (the username you created with BotFather)</li>
              <li>Student sends <code style={{ background:'#fef3c7', padding:'1px 6px', borderRadius:4 }}>/start</code> — if bot token is set, connection is automatic</li>
              <li>If automatic connection fails, ask the student to message <strong>@userinfobot</strong> on Telegram to get their Chat ID</li>
              <li>Enter that Chat ID below using the <strong>Manual Connect</strong> button</li>
            </ol>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          {loading ? <Spinner /> : !(students||[]).length ? (
            <EmptyState icon={Send} title="No students" />
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Student</th><th>Teacher</th><th>Telegram Username</th>
                    <th>Chat ID</th><th>Status</th><th>Connected At</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.student_id}>
                      <td>{s.full_name}</td>
                      <td>{s.teacher_name || '—'}</td>
                      <td>{s.telegram_username ? `@${s.telegram_username}` : <span className={styles.muted}>—</span>}</td>
                      <td className={styles.muted}>{s.chat_id || '—'}</td>
                      <td>
                        <Badge
                          status={s.connected ? 'connected' : 'not_connected'}
                          label={s.connected ? 'Connected' : 'Not connected'}
                        />
                      </td>
                      <td>{s.connected_at ? formatDate(s.connected_at) : '—'}</td>
                      <td>
                        <Button size="sm" variant={s.connected ? 'secondary' : 'primary'}
                          onClick={() => openConnect(s)}>
                          <Link size={13} /> {s.connected ? 'Update' : 'Connect'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Manual Connect Modal */}
      <Modal isOpen={!!connectModal} onClose={() => setConnectModal(null)} title={`Connect — ${connectModal?.full_name}`} size="sm">
        <form onSubmit={handleConnect} className={styles.form}>
          <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8, padding:'12px 14px', fontSize:'0.875rem', color:'#166534' }}>
            Ask the student to message <strong>@userinfobot</strong> on Telegram.<br />
            It will reply with their Chat ID (a number like <code>123456789</code>).
          </div>
          <Input
            label="Telegram Chat ID"
            value={chatId}
            onChange={e => setChatId(e.target.value)}
            placeholder="e.g. 123456789"
            required
          />
          <Input
            label="Telegram Username (optional)"
            value={tgUsername}
            onChange={e => setTgUsername(e.target.value)}
            placeholder="@username"
          />
          <div className={styles.formActions}>
            <Button type="button" variant="secondary" onClick={() => setConnectModal(null)}>Cancel</Button>
            <Button type="submit" loading={saving}>Connect Student</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Telegram;
