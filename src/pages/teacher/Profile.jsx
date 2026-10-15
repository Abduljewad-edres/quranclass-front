import { useEffect, useState } from 'react';
import api        from '../../services/api';
import useApi     from '../../hooks/useApi';
import { useAuth }       from '../../context/AuthContext';
import { useToast }      from '../../components/ui/Toast';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Button     from '../../components/ui/Button';
import Input      from '../../components/ui/Input';
import Select     from '../../components/ui/Select';
import Spinner    from '../../components/ui/Spinner';
import { formatCurrency, getErrorMessage } from '../../utils/helpers';
import tStyles    from './Teacher.module.css';
import styles     from '../admin/Page.module.css';

const SPECS = ['hifz','qaida','nethor','tajweed','recitation','other'];
const DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const Profile = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const { data: me, loading, execute: loadMe } = useApi(() => api.get('/auth/me'), null);

  const [editMode, setEditMode] = useState(false);
  const [profileForm,  setProfileForm]  = useState({});
  const [profileSaving,setProfileSaving]= useState(false);

  const [pwdForm,   setPwdForm]   = useState({ currentPassword:'', newPassword:'', confirm:'' });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdError,  setPwdError]  = useState('');

  useEffect(() => { loadMe(); }, [loadMe]);

  useEffect(() => {
    if (me) {
      setProfileForm({
        fullName:         me.full_name || '',
        email:            me.email || '',
        phone:            me.phone || '',
        telegramUsername: me.telegram_username || '',
        specialization:   me.specialization || 'other',
        teachingTime:     me.teaching_time || '',
        teachingDays:     me.teaching_days ? me.teaching_days.split(',') : [],
        notes:            me.notes || '',
      });
    }
  }, [me]);

  const handleProfileChange = (e) =>
    setProfileForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const toggleDay = (d) => setProfileForm(p => ({
    ...p,
    teachingDays: p.teachingDays.includes(d)
      ? p.teachingDays.filter(x => x !== d)
      : [...p.teachingDays, d],
  }));

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await api.put(`/teachers/${user.id}`, {
        ...profileForm,
        monthlyRate: me.monthly_rate, // keep existing rate
      });
      toast.success('Profile updated');
      updateUser({ fullName: profileForm.fullName });
      setEditMode(false);
      loadMe();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setProfileSaving(false); }
  };

  const handlePwdChange = (e) => setPwdForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    setPwdError('');
    if (pwdForm.newPassword !== pwdForm.confirm) { setPwdError('Passwords do not match'); return; }
    if (pwdForm.newPassword.length < 6) { setPwdError('Minimum 6 characters'); return; }
    setPwdSaving(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: pwdForm.currentPassword,
        newPassword:     pwdForm.newPassword,
      });
      toast.success('Password changed');
      setPwdForm({ currentPassword:'', newPassword:'', confirm:'' });
    } catch (err) {
      setPwdError(getErrorMessage(err));
    } finally { setPwdSaving(false); }
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div className={tStyles.page}>
      <h1 className={tStyles.title}>My Profile</h1>

      {/* Profile Info / Edit */}
      <Card>
        <CardHeader>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span>Account Details</span>
            {!editMode && (
              <Button size="sm" variant="secondary" onClick={() => setEditMode(true)}>Edit</Button>
            )}
          </div>
        </CardHeader>
        <CardBody>
          {!editMode ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:16 }}>
              {[
                { label:'Full Name',       value: me?.full_name },
                { label:'Username',        value: `@${me?.username}` },
                { label:'Email',           value: me?.email || '—' },
                { label:'Phone',           value: me?.phone || '—' },
                { label:'Telegram',        value: me?.telegram_username ? `@${me.telegram_username}` : '—' },
                { label:'Specialization',  value: me?.specialization },
                { label:'Monthly Rate',    value: formatCurrency(me?.monthly_rate) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize:'0.75rem', color:'#94a3b8', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</div>
                  <div style={{ fontSize:'0.95rem', color:'#1e293b', fontWeight:500, marginTop:2, textTransform:'capitalize' }}>{value}</div>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleProfileSave} className={styles.form}>
              <div className={styles.row2}>
                <Input label="Full Name"        name="fullName"         value={profileForm.fullName}         onChange={handleProfileChange} required />
                <Input label="Email"            name="email"            type="email" value={profileForm.email}  onChange={handleProfileChange} />
              </div>
              <div className={styles.row2}>
                <Input label="Phone"            name="phone"            value={profileForm.phone}            onChange={handleProfileChange} />
                <Input label="Telegram Username" name="telegramUsername" value={profileForm.telegramUsername} onChange={handleProfileChange} placeholder="without @" />
              </div>
              <div className={styles.row2}>
                <Select label="Specialization" name="specialization" value={profileForm.specialization} onChange={handleProfileChange}>
                  {SPECS.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
                <Input label="Teaching Time" name="teachingTime" type="time" value={profileForm.teachingTime} onChange={handleProfileChange} />
              </div>
              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Teaching Days</legend>
                <div className={styles.dayBtns}>
                  {DAYS.map(d => (
                    <button type="button" key={d}
                      className={`${styles.dayBtn} ${profileForm.teachingDays?.includes(d) ? styles.dayActive : ''}`}
                      onClick={() => toggleDay(d)}>{d}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className={styles.formActions}>
                <Button type="button" variant="secondary" onClick={() => { setEditMode(false); }}>Cancel</Button>
                <Button type="submit" loading={profileSaving}>Save Changes</Button>
              </div>
            </form>
          )}
        </CardBody>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>Change Password</CardHeader>
        <CardBody>
          <form onSubmit={handlePwdSubmit} className={styles.form} style={{ maxWidth:420 }}>
            <Input label="Current Password" name="currentPassword" type="password"
              value={pwdForm.currentPassword} onChange={handlePwdChange} required autoComplete="current-password" />
            <Input label="New Password" name="newPassword" type="password"
              value={pwdForm.newPassword} onChange={handlePwdChange} required autoComplete="new-password" />
            <Input label="Confirm New Password" name="confirm" type="password"
              value={pwdForm.confirm} onChange={handlePwdChange} required autoComplete="new-password" error={pwdError} />
            <div>
              <Button type="submit" loading={pwdSaving}>Update Password</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default Profile;
