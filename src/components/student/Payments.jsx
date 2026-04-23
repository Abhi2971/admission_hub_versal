import React, { useState, useEffect, useCallback } from 'react';
import { getPaymentHistory } from '../../services/payment';
import Loader from '../common/Loader';
import Alert from '../common/Alert';

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const S = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    padding: '1.5rem',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)',
    minHeight: '100vh',
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.75rem',
    padding: '1rem 1.5rem',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))',
    backdropFilter: 'blur(10px)',
    borderRadius: 16,
    border: '1px solid rgba(226,232,240,0.8)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  title: { fontSize: 24, fontWeight: 700, background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 },
  sub:   { fontSize: 14, color: '#64748b', marginTop: 4, fontWeight: 500 },
  summaryRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 14,
    marginBottom: '1.5rem',
  },
  summaryCard: (borderColor) => ({
    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
    border: '1px solid rgba(226,232,240,0.8)',
    borderRadius: 14,
    padding: '1.25rem 1.5rem',
    borderTop: `4px solid ${borderColor}`,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
  }),
  summaryLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 },
  summaryValue: (color) => ({ fontSize: 28, fontWeight: 700, background: `linear-gradient(135deg, ${color}, ${color}cc)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }),
  card: {
    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
    border: '1px solid rgba(226,232,240,0.8)',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 2fr 1fr 1fr 1.8fr',
    gap: 0,
    padding: '14px 20px',
    background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
    borderBottom: '1px solid #e2e8f0',
  },
  thCell: {
    fontSize: 12,
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tableRow: (i) => ({
    display: 'grid',
    gridTemplateColumns: '1.4fr 2fr 1fr 1fr 1.8fr',
    gap: 0,
    padding: '16px 20px',
    background: i % 2 === 0 ? '#ffffff' : 'linear-gradient(135deg, #fafbfc, #f8fafc)',
    borderBottom: '1px solid #f1f5f9',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  }),
  tdPrimary: { fontSize: 14, color: '#1e293b', fontWeight: 500 },
  tdMono: {
    fontSize: 13,
    color: '#475569',
    fontFamily: "'DM Mono', monospace",
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  tdAmount: { fontSize: 14, fontWeight: 700, color: '#10b981' },
  tdMuted: { fontSize: 13, color: '#64748b' },
  empty: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#94a3b8',
    fontSize: 14,
  },
};

const STATUS_META = {
  success: { bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', color: '#059669', label: 'Success' },
  created: { bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#d97706', label: 'Pending' },
  failed:  { bg: 'linear-gradient(135deg, #fee2e2, #fecaca)', color: '#dc2626', label: 'Failed'  },
};

const StatusPill = ({ status }) => {
  const m = STATUS_META[status] || { bg: '#f3f4f6', color: '#374151', label: status };
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, padding: '3px 10px',
      borderRadius: 100, background: m.bg, color: m.color,
      display: 'inline-block',
    }}>
      {m.label}
    </span>
  );
};

/* ─── Main ────────────────────────────────────────────────────────────────── */
const StudentPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  const fetchPayments = useCallback(async () => {
    try {
      const response = await getPaymentHistory();
      setPayments(response.data);
    } catch {
      setError('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  if (loading) return <Loader size="lg" />;
  if (error)   return <Alert type="error" message={error} onClose={() => setError('')} />;

  const totalPaid = payments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + p.amount / 100, 0);

  const pending = payments.filter(p => p.status === 'created').length;
  const failed  = payments.filter(p => p.status === 'failed').length;

  return (
    <div style={S.page}>
      {/* ── Top bar ── */}
      <div style={S.topbar}>
        <div>
          <h1 style={S.title}>Payment History</h1>
          <p style={S.sub}>{payments.length} transaction{payments.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* ── Summary cards ── */}
      {payments.length > 0 && (
        <div style={S.summaryRow}>
          <div style={S.summaryCard('#3B6D11')}>
            <div style={S.summaryLabel}>Total paid</div>
            <div style={S.summaryValue('#3B6D11')}>₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style={S.summaryCard('#BA7517')}>
            <div style={S.summaryLabel}>Pending</div>
            <div style={S.summaryValue('#BA7517')}>{pending}</div>
          </div>
          <div style={S.summaryCard('#A32D2D')}>
            <div style={S.summaryLabel}>Failed</div>
            <div style={S.summaryValue('#A32D2D')}>{failed}</div>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      {payments.length === 0 ? (
        <div style={{ ...S.card }}>
          <div style={S.empty}>No payments found.</div>
        </div>
      ) : (
        <div style={S.card}>
          {/* Header */}
          <div style={S.tableHeader}>
            {['Date', 'Order ID', 'Amount', 'Status', 'Application'].map(h => (
              <div key={h} style={S.thCell}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {payments.map((payment, i) => (
            <div key={payment._id} style={S.tableRow(i)}>
              <div style={S.tdPrimary}>
                {new Date(payment.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </div>
              <div style={S.tdMono} title={payment.razorpay_order_id}>
                {payment.razorpay_order_id}
              </div>
              <div style={S.tdAmount}>
                ₹{(payment.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div>
                <StatusPill status={payment.status} />
              </div>
              <div style={S.tdMuted} title={payment.application_id}>
                {payment.application_id}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentPayments;