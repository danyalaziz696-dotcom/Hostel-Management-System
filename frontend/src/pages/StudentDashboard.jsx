import React, { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import * as ui from '../components/ui';
import { apiGet, apiPost, asArray, currentUser, getErrorMessage, number, text } from '../api';

const emptyRow = (label, colSpan) => (
  <tr>
    <td style={{ ...ui.td, textAlign: 'center', color: '#6b7280' }} colSpan={colSpan}>{label}</td>
  </tr>
);

const normalizeStudent = (student) => ({
  _id: text(student._id),
  studentId: text(student.studentId),
  studentName: text(student.studentName || student.name),
  course: text(student.course),
  year: text(student.year),
  roomNumber: text(student.roomNumber || student.room),
  block: text(student.block),
  phone: text(student.phone),
  email: text(student.email),
  joinDate: text(student.joinDate),
});

const normalizeComplaint = (complaint) => ({
  _id: text(complaint._id),
  type: text(complaint.type),
  desc: text(complaint.desc),
  date: text(complaint.date),
  priority: text(complaint.priority),
  status: text(complaint.status),
});

const normalizeNotice = (notice) => ({
  _id: text(notice._id),
  title: text(notice.title),
  content: text(notice.content),
  date: text(notice.date),
  category: text(notice.category),
  important: Boolean(notice.important),
});

const normalizePayment = (payment) => ({
  _id: text(payment._id),
  month: text(payment.month),
  amount: number(payment.amount),
  paid: number(payment.paid),
  date: text(payment.date),
  status: text(payment.status),
});

function SubmitComplaint({ student, complaints, loading, error, setError, refresh }) {
  const [form, setForm] = useState({ type: 'Plumbing', priority: 'Medium', desc: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await apiPost('/complaints', {
        studentId: student.studentId,
        studentName: student.studentName,
        roomNumber: student.roomNumber,
        type: form.type,
        priority: form.priority,
        desc: form.desc,
      });
      setForm({ type: 'Plumbing', priority: 'Medium', desc: '' });
      await refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div style={ui.pageTitle}>Submit Complaint</div>
      {error && <div style={{ ...ui.section, color: '#991b1b' }}>{error}</div>}
      <div style={ui.cardGrid}>
        {[
          { label: 'My Complaints', val: complaints.length, color: '#1a3a5c' },
          { label: 'Pending', val: complaints.filter((complaint) => complaint.status === 'Pending').length, color: '#991b1b' },
          { label: 'Resolved', val: complaints.filter((complaint) => complaint.status === 'Resolved').length, color: '#065f46' },
          { label: 'In Progress', val: complaints.filter((complaint) => complaint.status === 'In Progress').length, color: '#92400e' },
        ].map((card) => (
          <div key={card.label} style={ui.card(card.color)}>
            <div style={ui.cardLabel}>{card.label}</div>
            <div style={ui.cardValue}>{card.val}</div>
          </div>
        ))}
      </div>

      <div style={ui.section}>
        <div style={ui.sectionTitle}>New Complaint</div>
        <form onSubmit={handleSubmit}>
          <div style={ui.formGrid}>
            <div>
              <label style={ui.label}>Complaint Type *</label>
              <select style={ui.select} value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                {['Plumbing', 'Electrical', 'WiFi', 'Furniture', 'Cleanliness', 'Mess Food', 'Security', 'Other'].map((type) => <option key={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label style={ui.label}>Priority</label>
              <select style={ui.select} value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                {['Low', 'Medium', 'High'].map((priority) => <option key={priority}>{priority}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={ui.label}>Description *</label>
            <textarea style={ui.textarea} value={form.desc} onChange={(event) => setForm({ ...form, desc: event.target.value })} placeholder="Describe your issue in detail..." required />
          </div>
          <button style={ui.btnPrimary} type="submit">Submit Complaint</button>
        </form>
      </div>

      <div style={ui.section}>
        <div style={ui.sectionTitle}>My Complaint History</div>
        {loading ? <div style={ui.td}>Loading...</div> : (
          <table style={ui.table}>
            <thead>
              <tr>{['ID', 'Type', 'Description', 'Date Filed', 'Priority', 'Status'].map((header) => <th key={header} style={ui.th}>{header}</th>)}</tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? emptyRow('No records found', 6) : complaints.map((complaint) => (
                <tr key={complaint._id}>
                  <td style={{ ...ui.td, fontWeight: 700 }}>{complaint._id}</td>
                  <td style={ui.td}>{complaint.type}</td>
                  <td style={{ ...ui.td, fontSize: '12.5px' }}>{complaint.desc}</td>
                  <td style={ui.td}>{complaint.date}</td>
                  <td style={ui.td}><span style={ui.badge(complaint.priority === 'High' ? 'red' : complaint.priority === 'Medium' ? 'yellow' : 'blue')}>{complaint.priority}</span></td>
                  <td style={ui.td}><span style={ui.badge(complaint.status === 'Resolved' ? 'green' : complaint.status === 'Pending' ? 'red' : 'yellow')}>{complaint.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function RoomDetails({ student, roommates }) {
  return (
    <div>
      <div style={ui.pageTitle}>My Room Details</div>
      <div style={ui.cardGrid}>
        {[
          { label: 'Room Number', val: student.roomNumber, color: '#1a3a5c' },
          { label: 'Block', val: student.block ? 'Block ' + student.block : '', color: '#1e40af' },
          { label: 'Course', val: student.course, color: '#065f46' },
          { label: 'Student ID', val: student.studentId, color: '#92400e' },
        ].map((card) => (
          <div key={card.label} style={ui.card(card.color)}>
            <div style={ui.cardLabel}>{card.label}</div>
            <div style={{ ...ui.cardValue, fontSize: '20px' }}>{card.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div style={ui.section}>
          <div style={ui.sectionTitle}>My Information</div>
          {[
            ['Student ID', student.studentId],
            ['Full Name', student.studentName],
            ['Course', student.course],
            ['Year', student.year],
            ['Email', student.email],
            ['Phone', student.phone],
            ['Join Date', student.joinDate],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13.5px' }}>
              <span style={{ color: '#6b7280', fontWeight: 600 }}>{label}</span>
              <span style={{ color: '#1a1a2e', fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={ui.section}>
          <div style={ui.sectionTitle}>Room Status</div>
          {[
            ['Room Number', student.roomNumber],
            ['Block', student.block],
            ['Assigned', student.roomNumber ? 'Yes' : 'No'],
            ['Status', student.roomNumber ? 'Allocated' : 'Not allocated'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13.5px' }}>
              <span style={{ color: '#6b7280', fontWeight: 600 }}>{label}</span>
              <span style={{ color: '#1a1a2e', fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={ui.section}>
        <div style={ui.sectionTitle}>Roommates</div>
        <table style={ui.table}>
          <thead>
            <tr>{['Name', 'Student ID', 'Course', 'Year', 'Phone'].map((header) => <th key={header} style={ui.th}>{header}</th>)}</tr>
          </thead>
          <tbody>
            {roommates.length === 0 ? emptyRow('No records found', 5) : roommates.map((roommate) => (
              <tr key={roommate._id}>
                <td style={ui.td}>{roommate.studentName}</td>
                <td style={{ ...ui.td, fontWeight: 700 }}>{roommate.studentId}</td>
                <td style={ui.td}>{roommate.course}</td>
                <td style={ui.td}>{roommate.year}</td>
                <td style={ui.td}>{roommate.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NoticesPage({ notices, loading }) {
  const important = notices.filter((notice) => notice.important);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonth = notices.filter((notice) => notice.date.slice(0, 7) === currentMonth).length;

  return (
    <div>
      <div style={ui.pageTitle}>Hostel Notices</div>
      <div style={ui.cardGrid}>
        {[
          { label: 'Total Notices', val: notices.length, color: '#1a3a5c' },
          { label: 'Important', val: important.length, color: '#991b1b' },
          { label: 'General', val: notices.length - important.length, color: '#1e40af' },
          { label: 'This Month', val: thisMonth, color: '#065f46' },
        ].map((card) => (
          <div key={card.label} style={ui.card(card.color)}>
            <div style={ui.cardLabel}>{card.label}</div>
            <div style={ui.cardValue}>{card.val}</div>
          </div>
        ))}
      </div>

      <div style={ui.section}>
        <div style={ui.sectionTitle}>Important Notices</div>
        {loading ? <div style={ui.td}>Loading...</div> : important.length === 0 ? <div style={ui.td}>No records found</div> : important.map((notice) => (
          <div key={notice._id} style={{ border: '1px solid #fecaca', borderLeft: '4px solid #dc2626', borderRadius: '4px', padding: '14px 16px', marginBottom: '12px', backgroundColor: '#fff5f5' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e', marginBottom: '4px' }}>{notice.title}</div>
            <div style={{ fontSize: '13.5px', color: '#374151', marginBottom: '8px', whiteSpace: 'pre-wrap' }}>{notice.content || 'No details'}</div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6b7280' }}>
              <span>{notice.date}</span><span style={ui.badge('red')}>{notice.category}</span><span style={ui.badge('red')}>Important</span>
            </div>
          </div>
        ))}
      </div>

      <div style={ui.section}>
        <div style={ui.sectionTitle}>All Notices</div>
        <table style={ui.table}>
          <thead>
            <tr>{['ID', 'Title', 'Content', 'Category', 'Date', 'Priority'].map((header) => <th key={header} style={ui.th}>{header}</th>)}</tr>
          </thead>
          <tbody>
            {notices.length === 0 ? emptyRow('No records found', 6) : notices.map((notice) => (
              <tr key={notice._id}>
                <td style={{ ...ui.td, fontWeight: 700 }}>{notice._id}</td>
                <td style={{ ...ui.td, fontWeight: 600 }}>{notice.title}</td>
                <td style={{ ...ui.td, maxWidth: '300px', whiteSpace: 'pre-wrap' }}>{notice.content || 'No details'}</td>
                <td style={ui.td}><span style={ui.badge('blue')}>{notice.category}</span></td>
                <td style={ui.td}>{notice.date}</td>
                <td style={ui.td}><span style={ui.badge(notice.important ? 'red' : 'green')}>{notice.important ? 'Important' : 'General'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FeeStatus({ payments }) {
  const totalDue = payments.reduce((sum, payment) => sum + Math.max(0, payment.amount - payment.paid), 0);
  const totalPaid = payments.reduce((sum, payment) => sum + payment.paid, 0);
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const nextPayment = payments.find((payment) => payment.status !== 'Paid');

  return (
    <div>
      <div style={ui.pageTitle}>Fee Status</div>
      <div style={ui.cardGrid}>
        {[
          { label: 'Total Fee', val: 'Rs ' + totalAmount.toLocaleString(), color: '#1a3a5c' },
          { label: 'Amount Paid', val: 'Rs ' + totalPaid.toLocaleString(), color: '#065f46' },
          { label: 'Amount Due', val: 'Rs ' + totalDue.toLocaleString(), color: '#991b1b' },
          { label: 'Next Due Month', val: nextPayment ? nextPayment.month : '', color: '#92400e' },
        ].map((card) => (
          <div key={card.label} style={ui.card(card.color)}>
            <div style={ui.cardLabel}>{card.label}</div>
            <div style={{ ...ui.cardValue, fontSize: text(card.val).length > 8 ? '18px' : '26px' }}>{card.val}</div>
          </div>
        ))}
      </div>

      <div style={ui.section}>
        <div style={ui.sectionTitle}>Fee Payment History</div>
        <table style={ui.table}>
          <thead>
            <tr>{['Month', 'Amount', 'Paid', 'Date', 'Status'].map((header) => <th key={header} style={ui.th}>{header}</th>)}</tr>
          </thead>
          <tbody>
            {payments.length === 0 ? emptyRow('No records found', 5) : payments.map((payment) => (
              <tr key={payment._id}>
                <td style={{ ...ui.td, fontWeight: 600 }}>{payment.month}</td>
                <td style={ui.td}>{payment.amount.toLocaleString()}</td>
                <td style={{ ...ui.td, color: payment.paid > 0 ? '#065f46' : '#991b1b', fontWeight: 600 }}>{payment.paid.toLocaleString()}</td>
                <td style={ui.td}>{payment.date}</td>
                <td style={ui.td}><span style={ui.badge(payment.status === 'Paid' ? 'green' : payment.status === 'Partial' ? 'yellow' : 'red')}>{payment.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const MENU = [
  { key: 'complaint', label: 'Submit Complaint', icon: 'Com' },
  { key: 'room', label: 'Room Details', icon: 'Room' },
  { key: 'notices', label: 'Notices', icon: 'Notice' },
  { key: 'fees', label: 'Fee Status', icon: 'Fee' },
];

export default function StudentDashboard() {
  const [page, setPage] = useState('room');
  const [student, setStudent] = useState(normalizeStudent({}));
  const [roommates, setRoommates] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = currentUser();
  const studentId = text(user.studentId || user.username);
  const studentName = text(user.name);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const studentData = await apiGet('/students');
      const students = asArray(studentData).map(normalizeStudent);
      const currentStudent = students.find((item) => item.studentId === studentId)
        || students.find((item) => item.studentName.toLowerCase() === studentName.toLowerCase())
        || students[0]
        || normalizeStudent({});
      const effectiveStudentId = currentStudent.studentId || studentId;
      const [complaintData, noticeData, paymentData] = await Promise.all([
        apiGet(`/complaints?studentId=${encodeURIComponent(effectiveStudentId)}`),
        apiGet('/notices/published'),
        apiGet(`/payments?studentId=${encodeURIComponent(effectiveStudentId)}`),
      ]);
      setStudent(currentStudent);
      setRoommates(students.filter((item) => item.roomNumber && item.roomNumber === currentStudent.roomNumber && item.studentId !== currentStudent.studentId));
      setComplaints(asArray(complaintData).map(normalizeComplaint));
      setNotices(asArray(noticeData).map(normalizeNotice));
      setPayments(asArray(paymentData).map(normalizePayment));
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [studentId, studentName]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const pageContent = {
    complaint: <SubmitComplaint student={student} complaints={complaints} loading={loading} error={error} setError={setError} refresh={refresh} />,
    room: <RoomDetails student={student} roommates={roommates} />,
    notices: <NoticesPage notices={notices} loading={loading} />,
    fees: <FeeStatus payments={payments} />,
  };

  return (
    <DashboardLayout role="Student" menuItems={MENU} activePage={page} onPageChange={setPage}>
      {error && page !== 'complaint' && <div style={{ ...ui.section, color: '#991b1b' }}>{error}</div>}
      {pageContent[page] || pageContent.room}
    </DashboardLayout>
  );
}
