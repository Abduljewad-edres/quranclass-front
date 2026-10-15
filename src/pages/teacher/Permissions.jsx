import { useEffect, useState } from 'react';
import { Plus, ClipboardList } from 'lucide-react';
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
import Select     from '../../components/ui/Select';
import { formatDate, getErrorMessage } from '../../utils/helpers';
import tStyles    from './Teacher.module.css';
import styles     from '../admin/Page.module.css';

const TYPES = ['leave','schedule_change','class_cancellation','student_issue','emergency','other'];
const BLANK = { type:'leave', requestDate:'', reason:'' };

const Permissions = () => {
  const toast = useToast();
  const { data: perms, loading, execute: load } = useApi(() => api.get('/permissions'), []);
  const [modal,  setModal]  = useState(false);
  const [saving, setSaving] = useState(false);
  const [form,   setForm]   = useState(BLANK);

  useEffect(() => { load(); }, [load]);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/permissions', form);
      toast.success('Permission request submitted');
      setModal(false); setForm(BLANK); load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setSaving(false); }
  };

  return (
    <div className={tStyles.page}>
      <div className={tStyles.header}>
        <h1 className={tStyles.title}>Permissions</h1>
        <Button size="sm" onClick={() => setModal(true)}><Plus size={14} /> New Request</Button>
      </div>

      <Card>
        <CardBody>
          {loading ? <Spinner /> : !(perms||[]).length ? (
            <EmptyState icon={ClipboardList} title="No permission requests" description="Submit a request when you need leave or a schedule change." />
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Type</th><th>Date</th><th>Reason</th><th>Status</th><th>Reviewed At</th></tr></thead>
                <tbody>
                  {perms.map(p => (
                    <tr key={p.id}>
                      <td className={styles.capitalize}>{p.type.replace('_',' ')}</td>
                      <td>{formatDate(p.request_date)}</td>
                      <td style={{ maxWidth:200, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.reason}</td>
                      <td><Badge status={p.status} /></td>
                      <td>{p.reviewed_at ? formatDate(p.reviewed_at) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="New Permission Request">
        <form onSubmit={handleSubmit} className={styles.form}>
          <Select label="Type" name="type" value={form.type} onChange={handleChange}>
            {TYPES.map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
          </Select>
          <Input label="Request Date" name="requestDate" type="date" value={form.requestDate} onChange={handleChange} required />
          <div>
            <label style={{ fontSize:'0.875rem', fontWeight:500, color:'#374151', display:'block', marginBottom:4 }}>Reason</label>
            <textarea name="reason" value={form.reason} onChange={handleChange} required
              style={{ width:'100%', padding:'9px 12px', border:'1px solid #d1d5db', borderRadius:8, fontSize:'0.9rem', minHeight:80, resize:'vertical', boxSizing:'border-box' }} />
          </div>
          <div className={styles.formActions}>
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Submit</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Permissions;
