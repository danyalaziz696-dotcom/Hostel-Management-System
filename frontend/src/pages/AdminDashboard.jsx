import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import * as ui from '../components/ui';
import { apiDelete, apiGet, apiPost, apiPut, asArray, getErrorMessage, number, text } from '../api';

const emptyRow = (label, colSpan) => (
  <tr>
    <td style={{ ...ui.td, textAlign: 'center', color: '#6b7280' }} colSpan={colSpan}>{label}</td>
  </tr>
);

const normalizeNotice = (notice) => ({
  _id: text(notice._id),
  title: text(notice.title),
  category: text(notice.category),
  date: text(notice.date),
  content: text(notice.content),
  author: text(notice.author),
  status: text(notice.status),
  important: Boolean(notice.important),
});

const normalizeUser = (user) => ({
  _id: text(user._id),
  name: text(user.name),
  username: text(user.username),
  role: text(user.role),
  email: text(user.email),
  status: text(user.status),
  password: text(user.password),
});

function ManageNotices({ notices, loading, error, setError, refresh }) {
  const [form, setForm] = useState({ title: '', category: 'General', date: '', content: '' });
  const active = notices.filter((notice) => notice.status === 'Active').length;
  const categories = new Set(notices.map((notice) => notice.category).filter(Boolean)).size;

  const handleAdd = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await apiPost('/notices', { ...form, status: 'Active', author: 'Admin', published: true });
      setForm({ title: '', category: 'General', date: '', content: '' });
      await refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (_id) => {
    setError('');
    try {
      await apiDelete(`/notices/${_id}`);
      await refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div style={ui.pageTitle}>Manage Notices</div>
      {error && <div style={{ ...ui.section, color: '#991b1b' }}>{error}</div>}
      <div style={ui.cardGrid}>
        {[
          { label: 'Total Notices', val: notices.length, color: '#1a3a5c' },
          { label: 'Active Notices', val: active, color: '#065f46' },
          { label: 'Expired Notices', val: notices.length - active, color: '#92400e' },
          { label: 'Categories', val: categories, color: '#1e40af' },
        ].map((card) => (
          <div key={card.label} style={ui.card(card.color)}>
            <div style={ui.cardLabel}>{card.label}</div>
            <div style={ui.cardValue}>{card.val}</div>
          </div>
        ))}
      </div>

      <div style={ui.section}>
        <div style={ui.sectionTitle}>Post New Notice</div>
        <form onSubmit={handleAdd}>
          <div style={ui.formGrid}>
            <div>
              <label style={ui.label}>Notice Title *</label>
              <input style={ui.input} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Enter notice title" required />
            </div>
            <div>
              <label style={ui.label}>Category</label>
              <select style={ui.select} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                {['General', 'Finance', 'Maintenance', 'Event', 'Mess', 'Emergency'].map((category) => <option key={category}>{category}</option>)}
              </select>
            </div>
            <div>
              <label style={ui.label}>Date *</label>
              <input type="date" style={ui.input} value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={ui.label}>Notice Content</label>
            <textarea style={ui.textarea} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="Enter notice details..." />
          </div>
          <button style={ui.btnPrimary} type="submit">Post Notice</button>
        </form>
      </div>

      <div style={ui.section}>
        <div style={ui.sectionTitle}>All Notices</div>
        {loading ? <div style={ui.td}>Loading...</div> : (
          <table style={ui.table}>
            <thead>
              <tr>{['ID', 'Title', 'Content', 'Category', 'Date', 'Author', 'Status', 'Actions'].map((header) => <th key={header} style={ui.th}>{header}</th>)}</tr>
            </thead>
            <tbody>
              {notices.length === 0 ? emptyRow('No records found', 8) : notices.map((notice) => (
                <tr key={notice._id}>
                  <td style={ui.td}>{notice._id}</td>
                  <td style={{ ...ui.td, fontWeight: 600 }}>{notice.title}</td>
                  <td style={{ ...ui.td, maxWidth: '260px', whiteSpace: 'pre-wrap' }}>{notice.content || 'No details'}</td>
                  <td style={ui.td}><span style={ui.badge('blue')}>{notice.category}</span></td>
                  <td style={ui.td}>{notice.date}</td>
                  <td style={ui.td}>{notice.author}</td>
                  <td style={ui.td}><span style={ui.badge(notice.status === 'Active' ? 'green' : 'yellow')}>{notice.status}</span></td>
                  <td style={ui.td}><button style={ui.btnDanger} onClick={() => handleDelete(notice._id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function RevenueReport({ report, students, loading }) {
  const payments = asArray(report.payments).map((payment) => ({
    _id: text(payment._id),
    month: text(payment.month),
    amount: number(payment.amount),
    paid: number(payment.paid),
    status: text(payment.status),
  }));
  const monthly = useMemo(() => {
    const groups = {};
    payments.forEach((payment) => {
      const month = payment.month || 'Unassigned';
      groups[month] = groups[month] || { _id: month, month, expected: 0, collected: 0, count: 0 };
      groups[month].expected += payment.amount;
      groups[month].collected += payment.paid;
      groups[month].count += 1;
    });
    return Object.values(groups);
  }, [payments]);

  const totalCollected = number(report.totalCollected);
  const totalPending = number(report.totalPending);
  const totalExpected = number(report.totalExpected);

  return (
    <div>
      <div style={ui.pageTitle}>Revenue Report</div>
      <div style={ui.cardGrid}>
        {[
          { label: 'Total Revenue', val: 'Rs ' + totalCollected.toLocaleString(), color: '#065f46' },
          { label: 'Total Pending', val: 'Rs ' + totalPending.toLocaleString(), color: '#991b1b' },
          { label: 'Collection Rate', val: totalExpected ? Math.round((totalCollected / totalExpected) * 100) + '%' : '0%', color: '#1a3a5c' },
          { label: 'Active Students', val: students.filter((student) => student.status !== 'Inactive').length, color: '#1e40af' },
        ].map((card) => (
          <div key={card.label} style={ui.card(card.color)}>
            <div style={ui.cardLabel}>{card.label}</div>
            <div style={{ ...ui.cardValue, fontSize: text(card.val).length > 8 ? '18px' : '28px' }}>{card.val}</div>
          </div>
        ))}
      </div>
      <div style={ui.section}>
        <div style={ui.sectionTitle}>Monthly Revenue Breakdown</div>
        {loading ? <div style={ui.td}>Loading...</div> : (
          <table style={ui.table}>
            <thead>
              <tr>{['Month', 'Expected', 'Collected', 'Pending', 'Records', 'Collection %'].map((header) => <th key={header} style={ui.th}>{header}</th>)}</tr>
            </thead>
            <tbody>
              {monthly.length === 0 ? emptyRow('No records found', 6) : monthly.map((row) => {
                const pending = Math.max(0, row.expected - row.collected);
                const rate = row.expected ? Math.round((row.collected / row.expected) * 100) : 0;
                return (
                  <tr key={row._id}>
                    <td style={{ ...ui.td, fontWeight: 600 }}>{row.month}</td>
                    <td style={ui.td}>{row.expected.toLocaleString()}</td>
                    <td style={{ ...ui.td, color: '#065f46', fontWeight: 600 }}>{row.collected.toLocaleString()}</td>
                    <td style={{ ...ui.td, color: '#991b1b', fontWeight: 600 }}>{pending.toLocaleString()}</td>
                    <td style={ui.td}>{row.count}</td>
                    <td style={ui.td}>{rate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function OccupancyReport({ report, loading }) {
  const rooms = asArray(report.rooms).map((room) => ({
    _id: text(room._id),
    block: text(room.block || text(room.roomNumber).split('-')[0]),
    capacity: number(room.capacity),
    occupied: number(room.occupied),
  }));
  const blocks = useMemo(() => {
    const groups = {};
    rooms.forEach((room) => {
      const block = room.block || 'Unassigned';
      groups[block] = groups[block] || { _id: block, block, total: 0, capacity: 0, occupied: 0 };
      groups[block].total += 1;
      groups[block].capacity += room.capacity;
      groups[block].occupied += room.occupied;
    });
    return Object.values(groups);
  }, [rooms]);

  return (
    <div>
      <div style={ui.pageTitle}>Occupancy Report</div>
      <div style={ui.cardGrid}>
        {[
          { label: 'Total Rooms', val: number(report.totalRooms), color: '#1a3a5c' },
          { label: 'Occupied', val: number(report.totalOccupied), color: '#065f46' },
          { label: 'Available Beds', val: number(report.availableBeds), color: '#92400e' },
          { label: 'Overall Rate', val: number(report.occupancyRate) + '%', color: '#1e40af' },
        ].map((card) => (
          <div key={card.label} style={ui.card(card.color)}>
            <div style={ui.cardLabel}>{card.label}</div>
            <div style={ui.cardValue}>{card.val}</div>
          </div>
        ))}
      </div>
      <div style={ui.section}>
        <div style={ui.sectionTitle}>Block-wise Occupancy</div>
        {loading ? <div style={ui.td}>Loading...</div> : (
          <table style={ui.table}>
            <thead>
              <tr>{['Block', 'Total Rooms', 'Occupied', 'Available', 'Occupancy Rate', 'Status'].map((header) => <th key={header} style={ui.th}>{header}</th>)}</tr>
            </thead>
            <tbody>
              {blocks.length === 0 ? emptyRow('No records found', 6) : blocks.map((block) => {
                const available = Math.max(0, block.capacity - block.occupied);
                const rate = block.capacity ? Math.round((block.occupied / block.capacity) * 100) : 0;
                return (
                  <tr key={block._id}>
                    <td style={{ ...ui.td, fontWeight: 700 }}>Block {block.block}</td>
                    <td style={ui.td}>{block.total}</td>
                    <td style={{ ...ui.td, color: '#065f46', fontWeight: 600 }}>{block.occupied}</td>
                    <td style={{ ...ui.td, color: '#991b1b', fontWeight: 600 }}>{available}</td>
                    <td style={ui.td}>{rate}%</td>
                    <td style={ui.td}><span style={ui.badge(rate >= 90 ? 'green' : 'blue')}>{rate >= 90 ? 'High' : 'Normal'}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ComplaintReport({ report, loading }) {
  const complaints = asArray(report.complaints).map((complaint) => ({
    _id: text(complaint._id),
    studentName: text(complaint.studentName),
    type: text(complaint.type),
    desc: text(complaint.desc || complaint.description),
    date: text(complaint.date),
    priority: text(complaint.priority),
    status: text(complaint.status),
  }));

  return (
    <div>
      <div style={ui.pageTitle}>Complaint Report</div>
      <div style={ui.cardGrid}>
        {[
          { label: 'Total Complaints', val: number(report.totalComplaints), color: '#1a3a5c' },
          { label: 'Resolved', val: number(report.resolved), color: '#065f46' },
          { label: 'Pending', val: number(report.pending), color: '#991b1b' },
          { label: 'In Progress', val: number(report.inProgress), color: '#92400e' },
        ].map((card) => (
          <div key={card.label} style={ui.card(card.color)}>
            <div style={ui.cardLabel}>{card.label}</div>
            <div style={ui.cardValue}>{card.val}</div>
          </div>
        ))}
      </div>
      <div style={ui.section}>
        <div style={ui.sectionTitle}>Complaint Ledger</div>
        {loading ? <div style={ui.td}>Loading...</div> : (
          <table style={ui.table}>
            <thead>
              <tr>{['ID', 'Student', 'Type', 'Description', 'Date Filed', 'Priority', 'Status'].map((header) => <th key={header} style={ui.th}>{header}</th>)}</tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? emptyRow('No records found', 7) : complaints.map((complaint) => (
                <tr key={complaint._id}>
                  <td style={{ ...ui.td, fontWeight: 700 }}>{complaint._id}</td>
                  <td style={ui.td}>{complaint.studentName}</td>
                  <td style={ui.td}>{complaint.type}</td>
                  <td style={{ ...ui.td, maxWidth: '260px', whiteSpace: 'pre-wrap' }}>{complaint.desc || 'No details'}</td>
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

function ManageUsers({ users, loading, error, setError, refresh }) {
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'Student', email: '' });

  const handleAdd = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await apiPost('/users', { ...form, status: 'Active' });
      setForm({ name: '', username: '', password: '', role: 'Student', email: '' });
      await refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleToggle = async (user) => {
    setError('');
    try {
      await apiPut(`/users/${user._id}`, { status: user.status === 'Active' ? 'Inactive' : 'Active' });
      await refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div style={ui.pageTitle}>Manage Users</div>
      {error && <div style={{ ...ui.section, color: '#991b1b' }}>{error}</div>}
      <div style={ui.cardGrid}>
        {[
          { label: 'Total Users', val: users.length, color: '#1a3a5c' },
          { label: 'Students', val: users.filter((user) => user.role === 'Student').length, color: '#1e40af' },
          { label: 'Staff Members', val: users.filter((user) => user.role !== 'Student').length, color: '#065f46' },
          { label: 'Active Users', val: users.filter((user) => user.status === 'Active').length, color: '#065f46' },
        ].map((card) => (
          <div key={card.label} style={ui.card(card.color)}>
            <div style={ui.cardLabel}>{card.label}</div>
            <div style={ui.cardValue}>{card.val}</div>
          </div>
        ))}
      </div>

      <div style={ui.section}>
        <div style={ui.sectionTitle}>Add New User</div>
        <form onSubmit={handleAdd}>
          <div style={ui.formGrid}>
            <div>
              <label style={ui.label}>Full Name *</label>
              <input style={ui.input} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Full name" required />
            </div>
            <div>
              <label style={ui.label}>Username *</label>
              <input style={ui.input} value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} placeholder="Login username" required />
            </div>
            <div>
              <label style={ui.label}>Password *</label>
              <input type="password" style={ui.input} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Password" required />
            </div>
            <div>
              <label style={ui.label}>Email *</label>
              <input type="email" style={ui.input} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="email@hostel.edu" required />
            </div>
            <div>
              <label style={ui.label}>Role</label>
              <select style={ui.select} value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                {['Admin', 'Warden', 'Student', 'Payment Clerk', 'Mess Staff'].map((role) => <option key={role}>{role}</option>)}
              </select>
            </div>
          </div>
          <button style={ui.btnPrimary} type="submit">Add User</button>
        </form>
      </div>

      <div style={ui.section}>
        <div style={ui.sectionTitle}>User Directory</div>
        {loading ? <div style={ui.td}>Loading...</div> : (
          <table style={ui.table}>
            <thead>
              <tr>{['ID', 'Name', 'Username', 'Role', 'Email', 'Status', 'Actions'].map((header) => <th key={header} style={ui.th}>{header}</th>)}</tr>
            </thead>
            <tbody>
              {users.length === 0 ? emptyRow('No records found', 7) : users.map((user) => (
                <tr key={user._id}>
                  <td style={{ ...ui.td, fontWeight: 700 }}>{user._id}</td>
                  <td style={ui.td}>{user.name}</td>
                  <td style={ui.td}>{user.username}</td>
                  <td style={ui.td}><span style={ui.badge('blue')}>{user.role}</span></td>
                  <td style={ui.td}>{user.email}</td>
                  <td style={ui.td}><span style={ui.badge(user.status === 'Active' ? 'green' : 'red')}>{user.status}</span></td>
                  <td style={ui.td}>
                    <button style={user.status === 'Active' ? ui.btnDanger : ui.btnSuccess} onClick={() => handleToggle(user)}>
                      {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const MENU = [
  { key: 'notices', label: 'Manage Notices', icon: 'Notice' },
  {
    key: 'reports', label: 'Reports', icon: 'Report',
    children: [
      { key: 'revenue', label: 'Revenue Report', icon: 'Rev' },
      { key: 'occupancy', label: 'Occupancy Report', icon: 'Occ' },
      { key: 'complaints_report', label: 'Complaint Report', icon: 'Com' },
    ],
  },
  { key: 'users', label: 'Manage Users', icon: 'Users' },
];

export default function AdminDashboard() {
  const [page, setPage] = useState('notices');
  const [notices, setNotices] = useState([]);
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [revenue, setRevenue] = useState({});
  const [occupancy, setOccupancy] = useState({});
  const [complaints, setComplaints] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = async () => {
    setLoading(true);
    try {
      const [noticeData, userData, studentData, revenueData, occupancyData, complaintData] = await Promise.all([
        apiGet('/notices'),
        apiGet('/users'),
        apiGet('/students'),
        apiGet('/reports/revenue'),
        apiGet('/reports/occupancy'),
        apiGet('/reports/complaints'),
      ]);
      setNotices(asArray(noticeData).map(normalizeNotice));
      setUsers(asArray(userData).map(normalizeUser));
      setStudents(asArray(studentData));
      setRevenue(revenueData || {});
      setOccupancy(occupancyData || {});
      setComplaints(complaintData || {});
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const pageContent = {
    notices: <ManageNotices notices={notices} loading={loading} error={error} setError={setError} refresh={refresh} />,
    revenue: <RevenueReport report={revenue} students={students} loading={loading} />,
    occupancy: <OccupancyReport report={occupancy} loading={loading} />,
    complaints_report: <ComplaintReport report={complaints} loading={loading} />,
    users: <ManageUsers users={users} loading={loading} error={error} setError={setError} refresh={refresh} />,
  };

  return (
    <DashboardLayout role="Admin" menuItems={MENU} activePage={page} onPageChange={setPage}>
      {pageContent[page] || pageContent.notices}
    </DashboardLayout>
  );
}
