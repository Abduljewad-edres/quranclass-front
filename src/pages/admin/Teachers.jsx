import { useEffect, useState, useCallback } from 'react';
import { UserPlus, Search } from 'lucide-react';
import api     from '../../services/api';
import useApi  from '../../hooks/useApi';
import { useToast }   from '../../components/ui/Toast';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Button  from '../../components/ui/Button';
import Badge   from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal   from '../../components/ui/Modal';
import Input   from '../../components/ui/Input';
import Select  from '../../components/ui/Select';
import { formatCurrency, getErrorMessage } from '../../utils/helpers';
import styles  from './Page.module.css';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const SPECS = ['hifz','qaida','nethor','tajweed','recitation','other'];
const BLANK = { fullName:'', username:'', password:'', phone:'', telegramUsername:'', specialization:'other', teachingDays:[], teachingTime:'', monthlyRate:'' };

const Teachers = () => {
  const toast = useToast();
  const { data: teachers, loading, execute: load } = useApi(() => api.get('/teachers'), []);
  const [search, setSearch] = useState('');
  const [modal,  setModal]  = useState(false);
  const [saving, setSaving] = useState(false);
  const [form,   setForm]   = useState(BLANK);

  useEffect(() => { load(); }, [load]);

  const filtered = (teachers || []).filter(t =>
    t.full_name.toLowerCase().includes(search.toLowerCase()) ||
    t.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const toggleDay = (day) =>
    setForm(p => ({
      ...p,
      teachingDays: p.teachingDays.includes(day)
        ? p.teachingDays.filter(d => d !== day)
        : [...p.teachingDays, day],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.teachingDays.length) {
      toast.error('Please select at least one teaching day');
      return;
    }
    if (!form.monthlyRate || parseFloat(form.monthlyRate) < 0) {
      toast.error('Please enter a valid monthly rate');
      return;
    }
    setSaving(true);
    try {
      await api.post('/teachers', {
        ...form,
        monthlyRate: parseFloat(form.monthlyRate) || 0,
      });
      toast.success('Teacher created');
      setModal(false);
      setForm(BLANK);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (teacher) => {
    const next = teacher.status === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/teachers/${teacher.id}/status`, { status: next });
      toast.success(`Teacher ${next}`);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async (teacher) => {
    if (!window.confirm(`Delete ${teacher.full_name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/teachers/${teacher.id}`);
      toast.success('Teacher deleted');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Teachers</h1>
        <Button onClick={() => setModal(true)}>
          <UserPlus size={16} /> Add Teacher
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className={styles.searchRow}>
            <Search size={16} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search teachers…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search teachers"
            />
          </div>
        </CardHeader>
        <CardBody>
          {loading ? <Spinner /> : !filtered.length ? (
            <EmptyState icon={UserPlus} title="No teachers yet" description="Add your first teacher to get started." />
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th><th>Username</th><th>Specialization</th>
                    <th>Students</th><th>Rate</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id}>
                      <td>{t.full_name}</td>
                      <td className={styles.muted}>@{t.username}</td>
                      <td className={styles.capitalize}>{t.specialization}</td>
                      <td>{t.active_students}</td>
                      <td>{formatCurrency(t.monthly_rate)}</td>
                      <td><Badge status={t.status} /></td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <Button size="sm" variant="secondary" onClick={() => toggleStatus(t)}>
                            {t.status === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleDelete(t)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add Teacher Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Teacher" size="lg">
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row2}>
            <Input label="Full Name"   name="fullName"   value={form.fullName}   onChange={handleChange} required />
            <Input label="Username"    name="username"   value={form.username}   onChange={handleChange} required />
          </div>
          <div className={styles.row2}>
            <Input label="Temp Password" name="password" type="password" value={form.password} onChange={handleChange} required />
            <Input label="Phone"       name="phone"      value={form.phone}      onChange={handleChange} />
          </div>
          <div className={styles.row2}>
            <Input label="Telegram Username" name="telegramUsername" value={form.telegramUsername} onChange={handleChange} placeholder="@username" />
            <Select label="Specialization" name="specialization" value={form.specialization} onChange={handleChange}>
              {SPECS.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <div className={styles.row2}>
            <Input label="Teaching Time" name="teachingTime" type="time" value={form.teachingTime} onChange={handleChange} />
            <Input label="Rate per Student (ETB)" name="monthlyRate" type="number" min="0" step="0.01" value={form.monthlyRate} onChange={handleChange} required />
          </div>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Teaching Days</legend>
            <div className={styles.dayBtns}>
              {DAYS.map(d => (
                <button
                  type="button" key={d}
                  className={`${styles.dayBtn} ${form.teachingDays.includes(d) ? styles.dayActive : ''}`}
                  onClick={() => toggleDay(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </fieldset>
          <div className={styles.formActions}>
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Teacher</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Teachers;
