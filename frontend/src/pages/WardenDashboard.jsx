import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import * as ui from '../components/ui';
import { apiDelete, apiGet, apiPatch, apiPost, asArray, getErrorMessage, number, text } from '../api';

const initialRoomForm = { block: 'A', number: '', capacity: 2, type: 'Double' };
const initialAllocationForm = { studentId: '', studentName: '', room: '', block: 'A', date: '' };

const emptyRow = (label, colSpan) => (
  <tr>
    <td style={{ ...ui.td, textAlign: 'center', color: '#6b7280' }} colSpan={colSpan}>{label}</td>
  </tr>
);

const statusBadge = (status) => status === 'Vacant' || status === 'Active' || status === 'Resolved'
  ? 'green'
  : status === 'Available' || status === 'In Progress'
    ? 'blue'
    : status === 'Full' || status === 'Pending'
      ? 'red'
      : 'yellow';

const normalizeRoom = (room) => ({
  _id: text(room._id),
  block: text(room.block || text(room.roomNumber).split('-')[0]),
  roomNumber: text(room.roomNumber),
  capacity: number(room.capacity),
  occupied: number(room.occupied),
  status: text(room.status),
  type: text(room.type || 'Standard'),
});

const normalizeAllocation = (allocation) => ({
  _id: text(allocation._id),
  studentId: text(allocation.studentId),
  studentName: text(allocation.studentName),
  roomNumber: text(allocation.roomNumber),
  block: text(allocation.block),
  date: text(allocation.date),
  status: text(allocation.status),
  reason: text(allocation.reason),
  deallocatedAt: text(allocation.deallocatedAt),
});

const normalizeStudent = (student) => ({
  _id: text(student._id),
  studentId: text(student.studentId),
  studentName: text(student.studentName || student.name),
  course: text(student.course),
  year: text(student.year),
  roomNumber: text(student.roomNumber || student.room),
  phone: text(student.phone),
  joinDate: text(student.joinDate),
  status: text(student.status),
});

const normalizeComplaint = (complaint) => ({
  _id: text(complaint._id),
  studentId: text(complaint.studentId),
  studentName: text(complaint.studentName || complaint.student),
  roomNumber: text(complaint.roomNumber || complaint.room),
  type: text(complaint.type),
  desc: text(complaint.desc),
  date: text(complaint.date),
  priority: text(complaint.priority),
  status: text(complaint.status),
});

function ManageRooms({ rooms, loading, error, setError, refresh }) {
  const [form, setForm] = useState(initialRoomForm);
  const available = rooms.filter((room) => room.occupied < room.capacity).length;
  const full = rooms.filter((room) => room.occupied >= room.capacity && room.capacity > 0).length;

  const handleAdd = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await apiPost('/rooms', {
        roomNumber: `${form.block}-${form.number}`,
        block: form.block,
        type: form.type,
        capacity: Number(form.capacity),
        occupied: 0,
      });
      setForm(initialRoomForm);
      await refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (_id) => {
    setError('');
    try {
      await apiDelete(`/rooms/${_id}`);
      await refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div style={ui.pageTitle}>Manage Rooms</div>
      {error && <div style={{ ...ui.section, color: '#991b1b' }}>{error}</div>}
      <div style={ui.cardGrid}>
        {[
          { label: 'Total Rooms', val: rooms.length, color: '#1a3a5c' },
          { label: 'Available', val: available, color: '#065f46' },
          { label: 'Fully Occupied', val: full, color: '#991b1b' },
          { label: 'Total Capacity', val: rooms.reduce((sum, room) => sum + room.capacity, 0), color: '#1e40af' },
        ].map((card) => (
          <div key={card.label} style={ui.card(card.color)}>
            <div style={ui.cardLabel}>{card.label}</div>
            <div style={ui.cardValue}>{card.val}</div>
          </div>
        ))}
      </div>

      <div style={ui.section}>
        <div style={ui.sectionTitle}>Add New Room</div>
        <form onSubmit={handleAdd}>
          <div style={ui.formGrid}>
            <div>
              <label style={ui.label}>Block</label>
              <select style={ui.select} value={form.block} onChange={(event) => setForm({ ...form, block: event.target.value })}>
                {['A', 'B', 'C', 'D'].map((block) => <option key={block}>{block}</option>)}
              </select>
            </div>
            <div>
              <label style={ui.label}>Room Number *</label>
              <input style={ui.input} value={form.number} onChange={(event) => setForm({ ...form, number: event.target.value })} placeholder="e.g. 105" required />
            </div>
            <div>
              <label style={ui.label}>Capacity</label>
              <select style={ui.select} value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })}>
                {[1, 2, 3, 4].map((capacity) => <option key={capacity}>{capacity}</option>)}
              </select>
            </div>
            <div>
              <label style={ui.label}>Room Type</label>
              <select style={ui.select} value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                {['Single', 'Double', 'Triple', 'Quad'].map((type) => <option key={type}>{type}</option>)}
              </select>
            </div>
          </div>
          <button style={ui.btnPrimary} type="submit">Add Room</button>
        </form>
      </div>

      <div style={ui.section}>
        <div style={ui.sectionTitle}>Room Inventory</div>
        {loading ? <div style={ui.td}>Loading...</div> : (
          <table style={ui.table}>
            <thead>
              <tr>{['Room No.', 'Block', 'Type', 'Capacity', 'Occupied', 'Free Beds', 'Status', 'Actions'].map((header) => <th key={header} style={ui.th}>{header}</th>)}</tr>
            </thead>
            <tbody>
              {rooms.length === 0 ? emptyRow('No records found', 8) : rooms.map((room) => (
                <tr key={room._id}>
                  <td style={{ ...ui.td, fontWeight: 700 }}>{room.roomNumber}</td>
                  <td style={ui.td}>Block {room.block}</td>
                  <td style={ui.td}>{room.type}</td>
                  <td style={ui.td}>{room.capacity}</td>
                  <td style={ui.td}>{room.occupied}</td>
                  <td style={{ ...ui.td, fontWeight: 700, color: room.capacity - room.occupied > 0 ? '#065f46' : '#991b1b' }}>{Math.max(0, room.capacity - room.occupied)}</td>
                  <td style={ui.td}><span style={ui.badge(statusBadge(room.status))}>{room.status}</span></td>
                  <td style={ui.td}><button style={ui.btnDanger} onClick={() => handleDelete(room._id)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function AllocateRoom({ rooms, allocations, students, loading, error, setError, refresh }) {
  const [form, setForm] = useState(initialAllocationForm);
  const activeStudentIds = new Set(allocations.filter((allocation) => allocation.status === 'Active').map((allocation) => allocation.studentId));
  const waitlisted = students.length ? students.filter((student) => !activeStudentIds.has(student.studentId)).length : 0;
  const availableRooms = rooms.filter((room) => room.occupied < room.capacity).length;

  const handleAllocate = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await apiPost('/allocations', {
        studentId: form.studentId,
        studentName: form.studentName,
        roomNumber: `${form.block}-${form.room}`,
        block: form.block,
        date: form.date,
        status: 'Active',
      });
      setForm(initialAllocationForm);
      await refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div style={ui.pageTitle}>Allocate Room</div>
      {error && <div style={{ ...ui.section, color: '#991b1b' }}>{error}</div>}
      <div style={ui.cardGrid}>
        {[
          { label: 'Total Allocations', val: allocations.length, color: '#1a3a5c' },
          { label: 'Active', val: allocations.filter((allocation) => allocation.status === 'Active').length, color: '#065f46' },
          { label: 'Available Rooms', val: availableRooms, color: '#1e40af' },
          { label: 'Waitlisted', val: waitlisted, color: '#92400e' },
        ].map((card) => (
          <div key={card.label} style={ui.card(card.color)}>
            <div style={ui.cardLabel}>{card.label}</div>
            <div style={ui.cardValue}>{card.val}</div>
          </div>
        ))}
      </div>

      <div style={ui.section}>
        <div style={ui.sectionTitle}>New Room Allocation</div>
        <form onSubmit={handleAllocate}>
          <div style={ui.formGrid}>
            <div>
              <label style={ui.label}>Student ID *</label>
              <input style={ui.input} value={form.studentId} onChange={(event) => setForm({ ...form, studentId: event.target.value })} placeholder="e.g. STU007" required />
            </div>
            <div>
              <label style={ui.label}>Student Name *</label>
              <input style={ui.input} value={form.studentName} onChange={(event) => setForm({ ...form, studentName: event.target.value })} placeholder="Full name" required />
            </div>
            <div>
              <label style={ui.label}>Block</label>
              <select style={ui.select} value={form.block} onChange={(event) => setForm({ ...form, block: event.target.value })}>
                {['A', 'B', 'C', 'D'].map((block) => <option key={block}>{block}</option>)}
              </select>
            </div>
            <div>
              <label style={ui.label}>Room Number *</label>
              <input style={ui.input} value={form.room} onChange={(event) => setForm({ ...form, room: event.target.value })} placeholder="e.g. 201" required />
            </div>
            <div>
              <label style={ui.label}>Allocation Date *</label>
              <input type="date" style={ui.input} value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
            </div>
          </div>
          <button style={ui.btnPrimary} type="submit">Allocate Room</button>
        </form>
      </div>

      <div style={ui.section}>
        <div style={ui.sectionTitle}>Current Allocations</div>
        {loading ? <div style={ui.td}>Loading...</div> : (
          <table style={ui.table}>
            <thead>
              <tr>{['Student ID', 'Student Name', 'Room', 'Block', 'Date Allocated', 'Status'].map((header) => <th key={header} style={ui.th}>{header}</th>)}</tr>
            </thead>
            <tbody>
              {allocations.length === 0 ? emptyRow('No records found', 6) : allocations.map((allocation) => (
                <tr key={allocation._id}>
                  <td style={{ ...ui.td, fontWeight: 700 }}>{allocation.studentId}</td>
                  <td style={ui.td}>{allocation.studentName}</td>
                  <td style={{ ...ui.td, fontWeight: 600 }}>{allocation.roomNumber}</td>
                  <td style={ui.td}>Block {allocation.block}</td>
                  <td style={ui.td}>{allocation.date}</td>
                  <td style={ui.td}><span style={ui.badge(statusBadge(allocation.status))}>{allocation.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function DeallocateRoom({ activeAllocations, allAllocations, loading, error, setError, refresh }) {
  const [reasons, setReasons] = useState({});
  const history = allAllocations.filter((allocation) => allocation.status === 'Deallocated');
  const currentMonth = new Date().toISOString().slice(0, 7);
  const freedThisMonth = history.filter((allocation) => text(allocation.deallocatedAt).slice(0, 7) === currentMonth).length;

  const handleDeallocate = async (_id) => {
    setError('');
    try {
      await apiDelete(`/allocations/${_id}`, { reason: reasons[_id] || '' });
      setReasons({});
      await refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div style={ui.pageTitle}>Deallocate Room</div>
      {error && <div style={{ ...ui.section, color: '#991b1b' }}>{error}</div>}
      <div style={ui.cardGrid}>
        {[
          { label: 'Currently Allocated', val: activeAllocations.length, color: '#1a3a5c' },
          { label: 'Deallocated (Total)', val: history.length, color: '#991b1b' },
          { label: 'Rooms Freed This Month', val: freedThisMonth, color: '#065f46' },
          { label: 'Pending Departures', val: activeAllocations.length, color: '#92400e' },
        ].map((card) => (
          <div key={card.label} style={ui.card(card.color)}>
            <div style={ui.cardLabel}>{card.label}</div>
            <div style={ui.cardValue}>{card.val}</div>
          </div>
        ))}
      </div>

      <div style={ui.section}>
        <div style={ui.sectionTitle}>Active Room Allocations</div>
        {loading ? <div style={ui.td}>Loading...</div> : (
          <table style={ui.table}>
            <thead>
              <tr>{['Student ID', 'Student Name', 'Room', 'Since', 'Reason for Dealloc', 'Action'].map((header) => <th key={header} style={ui.th}>{header}</th>)}</tr>
            </thead>
            <tbody>
              {activeAllocations.length === 0 ? emptyRow('No records found', 6) : activeAllocations.map((allocation) => (
                <tr key={allocation._id}>
                  <td style={{ ...ui.td, fontWeight: 700 }}>{allocation.studentId}</td>
                  <td style={ui.td}>{allocation.studentName}</td>
                  <td style={{ ...ui.td, fontWeight: 600 }}>{allocation.roomNumber}</td>
                  <td style={ui.td}>{allocation.date}</td>
                  <td style={ui.td}>
                    <input style={{ ...ui.input, marginBottom: 0 }} placeholder="Reason (optional)" value={reasons[allocation._id] || ''} onChange={(event) => setReasons({ ...reasons, [allocation._id]: event.target.value })} />
                  </td>
                  <td style={ui.td}><button style={ui.btnDanger} onClick={() => handleDeallocate(allocation._id)}>Deallocate</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={ui.section}>
        <div style={ui.sectionTitle}>Deallocation History</div>
        <table style={ui.table}>
          <thead>
            <tr>{['Student ID', 'Name', 'Room', 'Date Vacated', 'Reason'].map((header) => <th key={header} style={ui.th}>{header}</th>)}</tr>
          </thead>
          <tbody>
            {history.length === 0 ? emptyRow('No records found', 5) : history.map((allocation) => (
              <tr key={allocation._id}>
                <td style={{ ...ui.td, fontWeight: 700 }}>{allocation.studentId}</td>
                <td style={ui.td}>{allocation.studentName}</td>
                <td style={ui.td}>{allocation.roomNumber}</td>
                <td style={ui.td}>{text(allocation.deallocatedAt).slice(0, 10)}</td>
                <td style={ui.td}>{allocation.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StudentRecords({ students, loading }) {
  const [search, setSearch] = useState('');
  const filtered = students.filter((student) => student.studentName.toLowerCase().includes(search.toLowerCase()) || student.studentId.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={ui.pageTitle}>Student Records</div>
      <div style={ui.cardGrid}>
        {[
          { label: 'Total Students', val: students.length, color: '#1a3a5c' },
          { label: '1st Year', val: students.filter((student) => student.year === '1st').length, color: '#1e40af' },
          { label: 'Final Year', val: students.filter((student) => student.year === '4th').length, color: '#92400e' },
          { label: 'Active Students', val: students.filter((student) => student.status !== 'Inactive').length, color: '#065f46' },
        ].map((card) => (
          <div key={card.label} style={ui.card(card.color)}>
            <div style={ui.cardLabel}>{card.label}</div>
            <div style={ui.cardValue}>{card.val}</div>
          </div>
        ))}
      </div>
      <div style={ui.section}>
        <div style={ui.sectionTitle}>Student Directory</div>
        <div style={{ marginBottom: '14px' }}>
          <input style={{ ...ui.input, maxWidth: '320px' }} placeholder="Search by name or ID..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        {loading ? <div style={ui.td}>Loading...</div> : (
          <table style={ui.table}>
            <thead>
              <tr>{['ID', 'Name', 'Course', 'Year', 'Room', 'Phone', 'Join Date'].map((header) => <th key={header} style={ui.th}>{header}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? emptyRow('No records found', 7) : filtered.map((student) => (
                <tr key={student._id}>
                  <td style={{ ...ui.td, fontWeight: 700 }}>{student.studentId}</td>
                  <td style={ui.td}>{student.studentName}</td>
                  <td style={ui.td}>{student.course}</td>
                  <td style={ui.td}><span style={ui.badge('blue')}>{student.year}</span></td>
                  <td style={{ ...ui.td, fontWeight: 600 }}>{student.roomNumber}</td>
                  <td style={ui.td}>{student.phone}</td>
                  <td style={ui.td}>{student.joinDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ComplaintsManagement({ complaints, loading, error, setError, refresh }) {
  const updateStatus = async (_id, status) => {
    setError('');
    try {
      await apiPatch(`/complaints/${_id}`, { status });
      await refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div style={ui.pageTitle}>Complaints Management</div>
      {error && <div style={{ ...ui.section, color: '#991b1b' }}>{error}</div>}
      <div style={ui.cardGrid}>
        {[
          { label: 'Total Complaints', val: complaints.length, color: '#1a3a5c' },
          { label: 'Pending', val: complaints.filter((complaint) => complaint.status === 'Pending').length, color: '#991b1b' },
          { label: 'In Progress', val: complaints.filter((complaint) => complaint.status === 'In Progress').length, color: '#92400e' },
          { label: 'Resolved', val: complaints.filter((complaint) => complaint.status === 'Resolved').length, color: '#065f46' },
        ].map((card) => (
          <div key={card.label} style={ui.card(card.color)}>
            <div style={ui.cardLabel}>{card.label}</div>
            <div style={ui.cardValue}>{card.val}</div>
          </div>
        ))}
      </div>
      <div style={ui.section}>
        <div style={ui.sectionTitle}>Complaint Queue</div>
        {loading ? <div style={ui.td}>Loading...</div> : (
          <table style={ui.table}>
            <thead>
              <tr>{['ID', 'Student', 'Room', 'Type', 'Description', 'Date', 'Priority', 'Status', 'Actions'].map((header) => <th key={header} style={ui.th}>{header}</th>)}</tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? emptyRow('No records found', 9) : complaints.map((complaint) => (
                <tr key={complaint._id}>
                  <td style={{ ...ui.td, fontWeight: 700 }}>{complaint._id}</td>
                  <td style={ui.td}>{complaint.studentName}</td>
                  <td style={ui.td}>{complaint.roomNumber}</td>
                  <td style={ui.td}>{complaint.type}</td>
                  <td style={{ ...ui.td, maxWidth: '180px', fontSize: '12px' }}>{complaint.desc}</td>
                  <td style={ui.td}>{complaint.date}</td>
                  <td style={ui.td}><span style={ui.badge(complaint.priority === 'High' ? 'red' : complaint.priority === 'Medium' ? 'yellow' : 'blue')}>{complaint.priority}</span></td>
                  <td style={ui.td}><span style={ui.badge(statusBadge(complaint.status))}>{complaint.status}</span></td>
                  <td style={{ ...ui.td, display: 'flex', gap: '6px' }}>
                    {complaint.status === 'Pending' && <button style={{ ...ui.btnSuccess, fontSize: '11px', padding: '4px 10px' }} onClick={() => updateStatus(complaint._id, 'In Progress')}>Start</button>}
                    {complaint.status !== 'Resolved' && <button style={{ ...ui.btnPrimary, fontSize: '11px', padding: '4px 10px' }} onClick={() => updateStatus(complaint._id, 'Resolved')}>Resolve</button>}
                    {complaint.status === 'Resolved' && <span style={{ fontSize: '12px', color: '#065f46', fontWeight: 600 }}>Done</span>}
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
  { key: 'rooms', label: 'Manage Rooms', icon: 'Room' },
  { key: 'allocate', label: 'Allocate Room', icon: 'Key' },
  { key: 'deallocate', label: 'Deallocate Room', icon: 'Out' },
  { key: 'students', label: 'Student Records', icon: 'Stu' },
  { key: 'complaints', label: 'Complaints Management', icon: 'Fix' },
];

export default function WardenDashboard() {
  const [page, setPage] = useState('rooms');
  const [rooms, setRooms] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [allAllocations, setAllAllocations] = useState([]);
  const [students, setStudents] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = async () => {
    setLoading(true);
    try {
      const [roomData, activeAllocationData, allAllocationData, studentData, complaintData] = await Promise.all([
        apiGet('/rooms'),
        apiGet('/allocations'),
        apiGet('/allocations?includeDeallocated=true'),
        apiGet('/students'),
        apiGet('/complaints'),
      ]);
      setRooms(asArray(roomData).map(normalizeRoom));
      setAllocations(asArray(activeAllocationData).map(normalizeAllocation));
      setAllAllocations(asArray(allAllocationData).map(normalizeAllocation));
      setStudents(asArray(studentData).map(normalizeStudent));
      setComplaints(asArray(complaintData).map(normalizeComplaint));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const activeAllocations = useMemo(() => allocations.filter((allocation) => allocation.status === 'Active'), [allocations]);

  const pageContent = {
    rooms: <ManageRooms rooms={rooms} loading={loading} error={error} setError={setError} refresh={refresh} />,
    allocate: <AllocateRoom rooms={rooms} allocations={activeAllocations} students={students} loading={loading} error={error} setError={setError} refresh={refresh} />,
    deallocate: <DeallocateRoom activeAllocations={activeAllocations} allAllocations={allAllocations} loading={loading} error={error} setError={setError} refresh={refresh} />,
    students: <StudentRecords students={students} loading={loading} />,
    complaints: <ComplaintsManagement complaints={complaints} loading={loading} error={error} setError={setError} refresh={refresh} />,
  };

  return (
    <DashboardLayout role="Warden" menuItems={MENU} activePage={page} onPageChange={setPage}>
      {pageContent[page] || pageContent.rooms}
    </DashboardLayout>
  );
}
