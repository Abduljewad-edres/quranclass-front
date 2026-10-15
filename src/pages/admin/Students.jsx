import { useEffect, useState } from 'react';
import { UserPlus, Search, UserCheck } from 'lucide-react';
import api        from '../../services/api';
import useApi     from '../../hooks/useApi';
import { useToast }      from '../../components/ui/Toast';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Button     from '../../components/ui/Button';
import Badge      from '../../components/ui/Badge';
import Spinner    from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal      from '../../components/ui/Modal';
import Input      from '../../components/ui/Input';
import Select     from '../../components/ui/Select';
import { getErrorMessage } from '../../utils/helpers';
import styles     from './Page.module.css';

const TYPES  = ['hifz','qaida','nethor','tajweed','recitation','other'];
const DAYS   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const BLANK  = { fullName:'', phone:'', guardianName:'', guardianPhone:'', learningType:'other', telegramUsername:'', notes:'' };
const BLANK_ASSIGN = { teacherId:'', teachingDays:[], teachingTime:'', effectiveDate: new Date().toISOString().slice(0,10) };

const Students = () => {
  const toast  = useToast();
  const { data: students, loading, execute: load }   = useApi(() => api.get('/students'), []);
  const { data: teachers, execute: loadTeachers }    = useApi(() => api.get('/teachers'), []);

  const [search,       setSearch]       = useState('');
  const [addModal,     setAddModal]     = useState(false);
  const [assignModal,  setAssignModal]  = useState(null);   // holds the student being assigned
  const [saving,       setSaving]       = useState(false);
  const [form,         setForm]         = useState(BLANK);
  const [assignForm,   setAssignForm]   = useState(BLANK_ASSIGN);

  useEffect(() => { load(); loadTeachers(); }, [load, loadTeachers]);

  const filtered = (students || []).filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange       = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleAssignChange = (e) => setAssignForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const toggleDay = (d) => setAssignForm(p => ({
    ...p,
    teachingDays: p.teachingDays.includes(d)
      ? p.teachingDays.filter(x => x !== d)
      : [...p.teachingDays, d],
  }));

  // Delete student
  const handleDelete = async (student) => {
    if (!window.confirm(`Delete "${student.full_name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/students/${student.id}`);
      toast.success('Student deleted');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // Add student
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/students', form);
      toast.success('Student created');
      setAddModal(false);
      setForm(BLANK);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false); }
  };

  // Open assign modal
  const openAssign = (student) => {
    setAssignModal(student);
    // Pre-fill days/time from existing assignment if any
    setAssignForm({
      teacherId:    student.teacher_id || '',
      teachingDays: student.teaching_days ? student.teaching_days.split(',') : [],
      teachingTime: student.teaching_time || '',
      effectiveDate: new Date().toISOString().slice(0, 10),
    });
  };

  // Submit assignment
  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignForm.teacherId) { toast.error('Please select a teacher'); return; }
    if (!assignForm.teachingDays.length) { toast.error('Please select at least one day'); return; }

    setSaving(true);
    try {
      // If student already has an active assignment → transfer, else create new
      if (assignModal.assignment_status === 'active' && assignModal.teacher_id) {
        // find active assignment id
        const { data: assignmentData } = await api.get('/assignments');
        const assignments = Array.isArray(assignmentData) ? assignmentData : (assignmentData?.data || []);
        const active = assignments.find(
          a => a.student_id === assignModal.id && a.status === 'active'
        );
        if (active && active.teacher_id !== parseInt(assignForm.teacherId)) {
          await api.put(`/assignments/${active.id}`, {
            newTeacherId:  parseInt(assignForm.teacherId),
            effectiveDate: assignForm.effectiveDate,
            teachingDays:  assignForm.teachingDays,
            teachingTime:  assignForm.teachingTime || null,
          });
          toast.success('Student transferred to new teacher');
        } else {
          toast.warning('Student is already assigned to this teacher');
        }
      } else {
        await api.post('/assignments', {
          studentId:     assignModal.id,
          teacherId:     parseInt(assignForm.teacherId),
          teachingDays:  assignForm.teachingDays,
          teachingTime:  assignForm.teachingTime || null,
          effectiveDate: assignForm.effectiveDate,
        });
        toast.success(`${assignModal.full_name} assigned successfully`);
      }
      setAssignModal(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Students</h1>
        <Button onClick={() => setAddModal(true)}><UserPlus size={16} /> Add Student</Button>
      </div>

      <Card>
        <CardHeader>
          <div className={styles.searchRow}>
            <Search size={16} className={styles.searchIcon} />
            <input className={styles.searchInput} placeholder="Search students…"
              value={search} onChange={e => setSearch(e.target.value)} aria-label="Search students" />
          </div>
        </CardHeader>
        <CardBody>
          {loading ? <Spinner /> : !filtered.length ? (
            <EmptyState icon={UserPlus} title="No students yet" />
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th><th>Learning Type</th><th>Teacher</th>
                    <th>Telegram</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id}>
                      <td>{s.full_name}</td>
                      <td className={styles.capitalize}>{s.learning_type}</td>
                      <td>
                        {s.teacher_name
                          ? <span style={{ color:'#16a34a', fontWeight:500 }}>{s.teacher_name}</span>
                          : <span className={styles.muted}>Unassigned</span>
                        }
                      </td>
                      <td>
                        <Badge
                          status={s.telegram_connected ? 'connected' : 'not_connected'}
                          label={s.telegram_connected ? 'Connected' : 'Not connected'}
                        />
                      </td>
                      <td><Badge status={s.status} /></td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <Button size="sm" variant={s.teacher_name ? 'secondary' : 'primary'}
                            onClick={() => openAssign(s)}>
                            <UserCheck size={13} />
                            {s.teacher_name ? 'Reassign' : 'Assign'}
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleDelete(s)}>
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

      {/* Add Student Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Student" size="lg">
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row2}>
            <Input label="Full Name"      name="fullName"      value={form.fullName}      onChange={handleChange} required />
            <Input label="Phone"          name="phone"         value={form.phone}         onChange={handleChange} />
          </div>
          <div className={styles.row2}>
            <Input label="Guardian Name"  name="guardianName"  value={form.guardianName}  onChange={handleChange} />
            <Input label="Guardian Phone" name="guardianPhone" value={form.guardianPhone} onChange={handleChange} />
          </div>
          <Select label="Learning Type" name="learningType" value={form.learningType} onChange={handleChange}>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Input label="Telegram Username" name="telegramUsername" value={form.telegramUsername} onChange={handleChange} placeholder="@username (without @)" />
          <Input label="Notes" name="notes" value={form.notes} onChange={handleChange} />
          <div className={styles.formActions}>
            <Button type="button" variant="secondary" onClick={() => setAddModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Student</Button>
          </div>
        </form>
      </Modal>

      {/* Assign Student Modal */}
      <Modal
        isOpen={!!assignModal}
        onClose={() => setAssignModal(null)}
        title={`Assign — ${assignModal?.full_name}`}
        size="md"
      >
        <form onSubmit={handleAssign} className={styles.form}>
          <Select label="Teacher" name="teacherId" value={assignForm.teacherId} onChange={handleAssignChange} required>
            <option value="">Select a teacher…</option>
            {(teachers || []).filter(t => t.status === 'active').map(t => (
              <option key={t.teacher_id} value={t.teacher_id}>{t.full_name}</option>
            ))}
          </Select>

          <div className={styles.row2}>
            <Input label="Effective Date" name="effectiveDate" type="date"
              value={assignForm.effectiveDate} onChange={handleAssignChange} required />
            <Input label="Teaching Time" name="teachingTime" type="time"
              value={assignForm.teachingTime} onChange={handleAssignChange} />
          </div>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Teaching Days</legend>
            <div className={styles.dayBtns}>
              {DAYS.map(d => (
                <button type="button" key={d}
                  className={`${styles.dayBtn} ${assignForm.teachingDays.includes(d) ? styles.dayActive : ''}`}
                  onClick={() => toggleDay(d)}>
                  {d}
                </button>
              ))}
            </div>
          </fieldset>

          <div className={styles.formActions}>
            <Button type="button" variant="secondary" onClick={() => setAssignModal(null)}>Cancel</Button>
            <Button type="submit" loading={saving}>
              {assignModal?.teacher_name ? 'Transfer Student' : 'Assign Student'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Students;
