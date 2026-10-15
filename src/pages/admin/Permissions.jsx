import { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import api        from '../../services/api';
import useApi     from '../../hooks/useApi';
import { useToast }      from '../../components/ui/Toast';
import Card, { CardBody } from '../../components/ui/Card';
import Button     from '../../components/ui/Button';
import Badge      from '../../components/ui/Badge';
import Spinner    from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal      from '../../components/ui/Modal';
import Select     from '../../components/ui/Select';
import { formatDate, getErrorMessage } from '../../utils/helpers';
import styles     from './Page.module.css';

const Permissions = () => {
  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState('pending');
  const [reviewModal,  setReviewModal]  = useState(null);  // { perm, action }
  const [reviewNote,   setReviewNote]   = useState('');
  const [reviewing,    setReviewing]    = useState(false);

  const { data: perms, loading, execute: load } = useApi(
    () => api.get('/permissions', { params: { status: statusFilter || undefined } }), []
  );

  useEffect(() => { load(); }, [load, statusFilter]);

  const openReview = (perm, action) => {
    setReviewModal({ perm, action });
    setReviewNote('');
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setReviewing(true);
    try {
      await api.patch(`/permissions/${reviewModal.perm.id}/${reviewModal.action}`, {
        reviewNotes: reviewNote || null,
      });
      toast.success(`Permission ${reviewModal.action}d`);
      setReviewModal(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setReviewing(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Permissions</h1>
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width:160 }}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Select>
      </div>

      <Card>
        <CardBody>
          {loading ? <Spinner /> : !(perms||[]).length ? (
            <EmptyState icon={ClipboardList} title="No permission requests" />
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Teacher</th><th>Type</th><th>Date</th><th>Reason</th>
                    <th>Status</th><th>Review Notes</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {perms.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight:500 }}>{p.teacher_name}</td>
                      <td className={styles.capitalize}>{p.type.replace('_',' ')}</td>
                      <td>{formatDate(p.request_date)}</td>
                      <td style={{ maxWidth:200, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                        {p.reason}
                      </td>
                      <td><Badge status={p.status} /></td>
                      <td className={styles.muted} style={{ maxWidth:160, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                        {p.review_notes || '—'}
                      </td>
                      <td>
                        {p.status === 'pending' && (
                          <div style={{ display:'flex', gap:6 }}>
                            <Button size="sm" onClick={() => openReview(p, 'approve')}>Approve</Button>
                            <Button size="sm" variant="danger" onClick={() => openReview(p, 'reject')}>Reject</Button>
                          </div>
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

      {/* Review Modal */}
      <Modal
        isOpen={!!reviewModal}
        onClose={() => setReviewModal(null)}
        title={`${reviewModal?.action === 'approve' ? 'Approve' : 'Reject'} Permission`}
        size="sm"
      >
        {reviewModal && (
          <form onSubmit={handleReview} className={styles.form}>
            <div style={{ background:'#f8fafc', borderRadius:8, padding:'12px 14px', fontSize:'0.875rem', color:'#475569' }}>
              <div><strong>Teacher:</strong> {reviewModal.perm.teacher_name}</div>
              <div><strong>Type:</strong> {reviewModal.perm.type.replace('_',' ')}</div>
              <div><strong>Date:</strong> {formatDate(reviewModal.perm.request_date)}</div>
              <div style={{ marginTop:6 }}><strong>Reason:</strong> {reviewModal.perm.reason}</div>
            </div>
            <div>
              <label style={{ fontSize:'0.875rem', fontWeight:500, color:'#374151', display:'block', marginBottom:4 }}>
                Review Notes (optional)
              </label>
              <textarea
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
                placeholder="Add a note for the teacher…"
                style={{ width:'100%', padding:'9px 12px', border:'1px solid #d1d5db', borderRadius:8, fontSize:'0.9rem', minHeight:70, resize:'vertical', boxSizing:'border-box' }}
              />
            </div>
            <div className={styles.formActions}>
              <Button type="button" variant="secondary" onClick={() => setReviewModal(null)}>Cancel</Button>
              <Button
                type="submit"
                loading={reviewing}
                variant={reviewModal.action === 'approve' ? 'primary' : 'danger'}
              >
                {reviewModal.action === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Permissions;
