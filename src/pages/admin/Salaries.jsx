import { useEffect, useState } from 'react';
import { DollarSign } from 'lucide-react';
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
import { formatDate, formatCurrency, getErrorMessage } from '../../utils/helpers';
import styles     from './Page.module.css';

const Salaries = () => {
  const toast  = useToast();
  const today  = new Date();
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`;

  const [month,       setMonth]       = useState(defaultMonth);
  const [genLoading,  setGenLoading]  = useState(false);
  const [payModal,    setPayModal]    = useState(null);   // salary record
  const [payForm,     setPayForm]     = useState({ amountPaid:'', paymentDate: today.toISOString().slice(0,10), paymentMethod:'cash' });
  const [paySaving,   setPaySaving]   = useState(false);

  const { data: salaries, loading, execute: load } = useApi(() => api.get('/salaries'), []);

  useEffect(() => { load(); }, [load]);

  const handleGenerate = async () => {
    setGenLoading(true);
    try {
      const res = await api.post('/salaries/generate', { month });
      toast.success(`Generated ${res.data.data.generated?.length ?? 0} salary records`);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setGenLoading(false); }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setPaySaving(true);
    try {
      await api.post(`/salaries/${payModal.id}/pay`, payForm);
      toast.success('Salary marked as paid');
      setPayModal(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setPaySaving(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Salaries</h1>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            style={{ padding:'8px 10px', border:'1px solid #d1d5db', borderRadius:8, fontSize:'0.875rem' }} />
          <Button onClick={handleGenerate} loading={genLoading}>Generate</Button>
        </div>
      </div>

      <Card>
        <CardBody>
          {loading ? <Spinner /> : !(salaries||[]).length ? (
            <EmptyState icon={DollarSign} title="No salary records" description="Generate salaries for a month to get started." />
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr><th>Teacher</th><th>Month</th><th>Students</th><th>Rate</th><th>Total</th><th>Status</th><th>Paid Date</th><th></th></tr>
                </thead>
                <tbody>
                  {salaries.map(s => (
                    <tr key={s.id}>
                      <td>{s.teacher_name}</td>
                      <td>{s.salary_month?.slice(0,7)}</td>
                      <td>{s.active_students}</td>
                      <td>{formatCurrency(s.rate_per_student)}</td>
                      <td style={{ fontWeight:600 }}>{formatCurrency(s.total_salary)}</td>
                      <td><Badge status={s.status} /></td>
                      <td>{s.payment_date ? formatDate(s.payment_date) : '—'}</td>
                      <td>
                        {s.status === 'pending' && (
                          <Button size="sm" onClick={() => { setPayModal(s); setPayForm(p => ({ ...p, amountPaid: s.total_salary })); }}>
                            Mark Paid
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={!!payModal} onClose={() => setPayModal(null)} title="Record Payment" size="sm">
        {payModal && (
          <form onSubmit={handlePay} className={styles.form}>
            <p style={{ margin:0, color:'#475569', fontSize:'0.875rem' }}>
              Teacher: <strong>{payModal.teacher_name}</strong><br />
              Salary: <strong>{formatCurrency(payModal.total_salary)}</strong>
            </p>
            <Input label="Amount Paid (ETB)" name="amountPaid" type="number" min="0" step="0.01"
              value={payForm.amountPaid} onChange={e => setPayForm(p => ({ ...p, amountPaid: e.target.value }))} required />
            <Input label="Payment Date" name="paymentDate" type="date"
              value={payForm.paymentDate} onChange={e => setPayForm(p => ({ ...p, paymentDate: e.target.value }))} required />
            <Input label="Payment Method" name="paymentMethod"
              value={payForm.paymentMethod} onChange={e => setPayForm(p => ({ ...p, paymentMethod: e.target.value }))} placeholder="cash / bank / telebirr" />
            <div className={styles.formActions}>
              <Button type="button" variant="secondary" onClick={() => setPayModal(null)}>Cancel</Button>
              <Button type="submit" loading={paySaving}>Confirm Payment</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Salaries;
