import { useEffect, useState } from 'react';
import api    from '../../services/api';
import useApi from '../../hooks/useApi';
import { useToast }  from '../../components/ui/Toast';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Button  from '../../components/ui/Button';
import Input   from '../../components/ui/Input';
import Select  from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import { getErrorMessage } from '../../utils/helpers';
import styles  from './Page.module.css';

const AdminSettings = () => {
  const toast = useToast();
  const { data, loading, execute: load } = useApi(() => api.get('/settings'), null);
  const [form,   setForm]   = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (data?.settings) setForm(data.settings);
  }, [data]);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', { settings: form });
      toast.success('Settings saved');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setSaving(false); }
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Settings</h1>
      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>General</CardHeader>
          <CardBody>
            <div className={styles.form}>
              <div className={styles.row2}>
                <Input label="System Name" name="system_name" value={form.system_name || ''} onChange={handleChange} />
                <Input label="Default Currency" name="default_currency" value={form.default_currency || ''} onChange={handleChange} />
              </div>
              <Input label="Timezone" name="timezone" value={form.timezone || ''} onChange={handleChange} />
              <Select label="Mid-Month Student Rule" name="mid_month_rule" value={form.mid_month_rule || 'count_at_end'} onChange={handleChange}>
                <option value="count_at_end">Count active students at end of month</option>
                <option value="count_at_start">Count active students at start of month</option>
                <option value="full_month">Only students active the full month</option>
                <option value="prorate">Prorate (future)</option>
              </Select>
            </div>
          </CardBody>
        </Card>

        <Card style={{ marginTop:16 }}>
          <CardHeader>Telegram Bot</CardHeader>
          <CardBody>
            <div className={styles.form}>
              <Input label="Bot Token" name="telegram_bot_token" value={form.telegram_bot_token || ''} onChange={handleChange} type="password" placeholder="Leave blank to keep existing" />
              <Input label="Bot Username" name="telegram_bot_username" value={form.telegram_bot_username || ''} onChange={handleChange} placeholder="without @" />
            </div>
          </CardBody>
        </Card>

        <div style={{ marginTop:16, display:'flex', justifyContent:'flex-end' }}>
          <Button type="submit" loading={saving}>Save Settings</Button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
