import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import * as ui from '../components/ui';
import { apiGet, apiPatch, apiPost, asArray, getErrorMessage, number, text } from '../api';

const initialForm = { studentId: '', studentName: '', roomNumber: '', month: '', amount: '', paid: '', method: 'Online' };

const emptyRow = (label, colSpan) => (
  <tr>
    <td style={{ ...ui.td, textAlign: 'center', color: '#6b7280' }} colSpan={colSpan}>{label}</td>
  </tr>
);

const normalizePayment = (payment) => ({
  _id: text(payment._id),
  studentId: text(payment.studentId),
  studentName: text(payment.studentName || payment.name),
  roomNumber: text(payment.roomNumber || payment.room),
  month: text(payment.month),
  amount: number(payment.amount),
  paid: number(payment.paid),
  method: text(payment.method),
  date: text(payment.date),
  transactionId: text(payment.transactionId),
  status: text(payment.status),
});

function PaymentRecords() {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      setPayments(asArray(await apiGet('/payments')).map(normalizePayment));
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filtered = payments.filter((payment) => {
    const matchStatus = filter === 'All' || payment.status === filter;
    const matchSearch = payment.studentName.toLowerCase().includes(search.toLowerCase()) || payment.studentId.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalCollected = payments.reduce((sum, payment) => sum + payment.paid, 0);
  const totalExpected = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalPending = Math.max(0, totalExpected - totalCollected);

  const handleMarkPaid = async (_id) => {
    setError('');
    try {
      await apiPatch(`/payments/${_id}/pay`, {});
      await fetchPayments();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleAddPayment = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await apiPost('/payments', {
        studentId: form.studentId,
        studentName: form.studentName,
        roomNumber: form.roomNumber,
        month: form.month,
        amount: Number(form.amount),
        paid: Number(form.paid || 0),
        method: form.method,
        date: new Date().toISOString().slice(0, 10),
      });
      setForm(initialForm);
      await fetchPayments();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div style={ui.pageTitle}>Payment Records</div>
      {error && <div style={{ ...ui.section, color: '#991b1b' }}>{error}</div>}
      <div style={ui.cardGrid}>
        {[
          { label: 'Total Records', val: payments.length, color: '#1a3a5c' },
          { label: 'Amount Collected', val: 'Rs ' + totalCollected.toLocaleString(), color: '#065f46' },
          { label: 'Amount Pending', val: 'Rs ' + totalPending.toLocaleString(), color: '#991b1b' },
          { label: 'Collection Rate', val: totalExpected ? Math.round((totalCollected / totalExpected) * 100) + '%' : '0%', color: '#1e40af' },
        ].map((card) => (
          <div key={card.label} style={ui.card(card.color)}>
            <div style={ui.cardLabel}>{card.label}</div>
            <div style={{ ...ui.cardValue, fontSize: text(card.val).length > 8 ? '18px' : '28px' }}>{card.val}</div>
          </div>
        ))}
      </div>

      <div style={ui.section}>
        <div style={ui.sectionTitle}>Record New Payment</div>
        <form onSubmit={handleAddPayment}>
          <div style={ui.formGrid}>
            <div>
              <label style={ui.label}>Student ID *</label>
              <input style={ui.input} value={form.studentId} onChange={(event) => setForm({ ...form, studentId: event.target.value })} placeholder="e.g. STU009" required />
            </div>
            <div>
              <label style={ui.label}>Student Name *</label>
              <input style={ui.input} value={form.studentName} onChange={(event) => setForm({ ...form, studentName: event.target.value })} placeholder="Full name" required />
            </div>
            <div>
              <label style={ui.label}>Room *</label>
              <input style={ui.input} value={form.roomNumber} onChange={(event) => setForm({ ...form, roomNumber: event.target.value })} placeholder="e.g. A-101" required />
            </div>
            <div>
              <label style={ui.label}>Month *</label>
              <input style={ui.input} value={form.month} onChange={(event) => setForm({ ...form, month: event.target.value })} placeholder="e.g. May 2026" required />
            </div>
            <div>
              <label style={ui.label}>Amount</label>
              <input type="number" style={ui.input} value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} required />
            </div>
            <div>
              <label style={ui.label}>Paid</label>
              <input type="number" style={ui.input} value={form.paid} onChange={(event) => setForm({ ...form, paid: event.target.value })} />
            </div>
            <div>
              <label style={ui.label}>Payment Method</label>
              <select style={ui.select} value={form.method} onChange={(event) => setForm({ ...form, method: event.target.value })}>
                {['Cash', 'Online', 'UPI', 'Cheque', 'NEFT'].map((method) => <option key={method}>{method}</option>)}
              </select>
            </div>
          </div>
          <button style={ui.btnPrimary} type="submit">Record Payment</button>
        </form>
      </div>

      <div style={ui.section}>
        <div style={ui.sectionTitle}>Payment Ledger</div>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <input style={{ ...ui.input, maxWidth: '240px', marginBottom: 0 }} placeholder="Search student..." value={search} onChange={(event) => setSearch(event.target.value)} />
          {['All', 'Paid', 'Partial', 'Unpaid'].map((status) => (
            <button key={status} onClick={() => setFilter(status)} style={{
              padding: '7px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              border: filter === status ? 'none' : '1px solid #d1d5db',
              backgroundColor: filter === status ? '#1a3a5c' : '#fff',
              color: filter === status ? '#fff' : '#374151',
            }}>{status}</button>
          ))}
        </div>
        {loading ? <div style={ui.td}>Loading...</div> : (
          <table style={ui.table}>
            <thead>
              <tr>{['Pay ID', 'Student ID', 'Name', 'Room', 'Month', 'Amount', 'Paid', 'Method', 'Date', 'Transaction ID', 'Status', 'Action'].map((header) => <th key={header} style={ui.th}>{header}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? emptyRow('No records found', 12) : filtered.map((payment) => (
                <tr key={payment._id}>
                  <td style={{ ...ui.td, fontWeight: 700, fontSize: '12px' }}>{payment._id}</td>
                  <td style={ui.td}>{payment.studentId}</td>
                  <td style={ui.td}>{payment.studentName}</td>
                  <td style={ui.td}>{payment.roomNumber}</td>
                  <td style={ui.td}>{payment.month}</td>
                  <td style={{ ...ui.td, fontWeight: 700 }}>Rs {payment.amount.toLocaleString()}</td>
                  <td style={{ ...ui.td, fontWeight: 700 }}>Rs {payment.paid.toLocaleString()}</td>
                  <td style={ui.td}>{payment.method}</td>
                  <td style={ui.td}>{payment.date}</td>
                  <td style={{ ...ui.td, fontSize: '11px' }}>{payment.transactionId}</td>
                  <td style={ui.td}><span style={ui.badge(payment.status === 'Paid' ? 'green' : payment.status === 'Partial' ? 'yellow' : 'red')}>{payment.status}</span></td>
                  <td style={ui.td}>
                    {payment.status !== 'Paid' ? (
                      <button style={{ ...ui.btnSuccess, fontSize: '11px', padding: '4px 10px' }} onClick={() => handleMarkPaid(payment._id)}>Mark Paid</button>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#065f46', fontWeight: 600 }}>Cleared</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div style={{ marginTop: '12px', fontSize: '13px', color: '#6b7280' }}>
          Showing {filtered.length} of {payments.length} records
        </div>
      </div>
    </div>
  );
}

const MENU = [{ key: 'payments', label: 'Payment Records', icon: 'Pay' }];

export default function FinanceDashboard() {
  const [page, setPage] = useState('payments');
  return (
    <DashboardLayout role="Payment Clerk" menuItems={MENU} activePage={page} onPageChange={setPage}>
      <PaymentRecords />
    </DashboardLayout>
  );
}
