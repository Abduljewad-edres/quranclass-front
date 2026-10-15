import { useEffect, useState } from 'react';
import { BookOpen, Plus, Users } from 'lucide-react';
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
import { formatDays, getErrorMessage } from '../../utils/helpers';
import styles     from './Page.module.css';

const DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const TYPES = ['hifz','qaida','nethor','tajweed','recitation','other'];
const BLANK = { teacherId:'', name:'', learningType:'other', teachingDays:[], teachingTime:'', description:'' };

const Groups = () => {
  const toast = useToast();
  const { data: groups,   loading,   execute: load }      = useApi(() => api.get('/groups'), []);
  const { data: teachers, execute: loadTeachers }         = useApi(() => api.get('/teachers'), []);
  const { data: allStudents, execute: loadStudents }      = useApi(() => api.get('/students'), []);

  const [modal,        setModal]        = useState(false);
  const [studentsModal,setStudentsModal]= useState(null);  // group object
  const [saving,       setSaving]       = useState(false);
  const [addingStudent,setAddingStudent]= useState(false);
  const [form,         setForm]         = useState(BLANK);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  useEffect(() => { load(); loadTeachers(); loadStudents(); }, [load, loadTeachers, loadStudents]);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const toggleDay    = (d)  => setForm(p => ({
    ...p, teachingDays: p.teachingDays.includes(d)
      ? p.teachingDays.filter(x => x !== d) : [...p.teachingDays, d],
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.teachingDays.length) { toast.error('Select at least one teaching day'); return; }
    setSaving(true);
    try {
      const res = await api.post('/groups', form);
      toast.success('Group created');
      setModal(false);
      setForm(BLANK);
      load();
      // Immediately open students modal for the new group
      const newGroup = { id: res.data.data.id, name: form.name, teacher_id: parseInt(form.teacherId), students: [] };
      setTimeout(() => openGroupStudents(newGroup), 300);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setSaving(false); }
  };

  // Open group students modal — refresh group detail
  const openGroupStudents = async (group) => {
    try {
      const res = await api.get(`/groups/${group.id}`);
      setStudentsModal(res.data.data);
      setSelectedStudentId('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // Students already in this group
  const groupStudentIds = (studentsModal?.students || []).map(s => s.id);

  // Students assigned to this group's teacher but NOT yet in this group
  const availableStudents = (allStudents || []).filter(s =>
    s.teacher_id === studentsModal?.teacher_id &&
    !groupStudentIds.includes(s.id)
  );

  const handleAddStudentToGroup = async () => {
    if (!selectedStudentId) { toast.error('Select a student'); return; }
    setAddingStudent(true);
    try {
      // Find active assignment for this student and update group
      const { data: assignmentData } = await api.get('/assignments');
      const assignments = Array.isArray(assignmentData) ? assignmentData : (assignmentData?.data || []);
      const active = assignments.find(
        a => a.student_id === parseInt(selectedStudentId) && a.status === 'active'
      );
      if (!active) { toast.error('Student has no active assignment'); return; }

      await api.put(`/assignments/${active.id}`, {
        newTeacherId:  active.teacher_id,
        newGroupId:    studentsModal.id,
        effectiveDate: new Date().toISOString().slice(0, 10),
        teachingDays:  active.teaching_days?.split(',') || [],
        teachingTime:  active.teaching_time || null,
      });

      toast.success('Student added to group');
      setSelectedStudentId('');
      openGroupStudents(studentsModal); // refresh
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setAddingStudent(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Groups</h1>
        <Button onClick={() => setModal(true)}><Plus size={16} /> Add Group</Button>
      </div>

      <Card>
        <CardBody>
          {loading ? <Spinner /> : !(groups || []).length ? (
            <EmptyState icon={BookOpen} title="No groups yet" />
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr><th>Name</th><th>Teacher</th><th>Type</th><th>Days</th><th>Time</th><th>Students</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  {groups.map(g => (
                    <tr key={g.id}>
                      <td style={{ fontWeight:600 }}>{g.name}</td>
                      <td>{g.teacher_name}</td>
                      <td className={styles.capitalize}>{g.learning_type}</td>
                      <td>{formatDays(g.teaching_days)}</td>
                      <td>{g.teaching_time || '—'}</td>
                      <td>{g.student_count}</td>
                      <td><Badge status={g.status} /></td>
                      <td>
                        <Button size="sm" variant="secondary" onClick={() => openGroupStudents(g)}>
                          <Users size={13} /> Students
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

      {/* Create Group Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Group" size="lg">
        <form onSubmit={handleSubmit} className={styles.form}>
          <Select label="Teacher" name="teacherId" value={form.teacherId} onChange={handleChange} required>
            <option value="">Select teacher…</option>
            {(teachers || []).filter(t => t.status === 'active').map(t => (
              <option key={t.teacher_id} value={t.teacher_id}>{t.full_name}</option>
            ))}
          </Select>
          <div className={styles.row2}>
            <Input label="Group Name" name="name" value={form.name} onChange={handleChange} required />
            <Select label="Learning Type" name="learningType" value={form.learningType} onChange={handleChange}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
          <div className={styles.row2}>
            <Input label="Teaching Time" name="teachingTime" type="time" value={form.teachingTime} onChange={handleChange} />
            <Input label="Description"   name="description"  value={form.description}  onChange={handleChange} />
          </div>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Teaching Days</legend>
            <div className={styles.dayBtns}>
              {DAYS.map(d => (
                <button type="button" key={d}
                  className={`${styles.dayBtn} ${form.teachingDays.includes(d) ? styles.dayActive : ''}`}
                  onClick={() => toggleDay(d)}>{d}
                </button>
              ))}
            </div>
          </fieldset>
          <div className={styles.formActions}>
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Group</Button>
          </div>
        </form>
      </Modal>

      {/* Group Students Modal */}
      <Modal
        isOpen={!!studentsModal}
        onClose={() => setStudentsModal(null)}
        title={`${studentsModal?.name} — Students`}
        size="md"
      >
        {studentsModal && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Add student to group */}
            <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
              <div style={{ flex:1 }}>
                <Select
                  label="Add student to this group"
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                >
                  <option value="">Select student…</option>
                  {availableStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.full_name}</option>
                  ))}
                </Select>
              </div>
              <Button onClick={handleAddStudentToGroup} loading={addingStudent} style={{ marginBottom:1 }}>
                Add
              </Button>
            </div>

            {availableStudents.length === 0 && !groupStudentIds.length && (
              <p style={{ fontSize:'0.8rem', color:'#94a3b8', margin:0 }}>
                No students available. Assign students to this teacher first from the Students page.
              </p>
            )}

            {/* Current students in group */}
            {groupStudentIds.length === 0 ? (
              <p style={{ color:'#94a3b8', fontSize:'0.875rem', margin:0 }}>No students in this group yet.</p>
            ) : (
              <div>
                <div style={{ fontSize:'0.78rem', fontWeight:600, color:'#64748b', textTransform:'uppercase', marginBottom:8 }}>
                  Current Students ({groupStudentIds.length})
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {studentsModal.students.map(s => (
                    <div key={s.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', background:'#f8fafc', borderRadius:8 }}>
                      <span style={{ fontWeight:500, fontSize:'0.875rem' }}>{s.full_name}</span>
                      <Badge status={s.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Groups;
