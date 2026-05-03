import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import * as ui from '../components/ui';
import { apiGet, apiPost, asArray, getErrorMessage, number, text } from '../api';

const emptyRow = (label, colSpan) => (
  <tr>
    <td style={{ ...ui.td, textAlign: 'center', color: '#6b7280' }} colSpan={colSpan}>{label}</td>
  </tr>
);

const normalizeAttendance = (attendance) => ({
  _id: text(attendance._id),
  date: text(attendance.date),
  meal: text(attendance.meal),
  present: number(attendance.present),
  absent: number(attendance.absent),
  total: number(attendance.total),
});

const normalizeStudent = (student) => ({
  _id: text(student._id),
  studentId: text(student.studentId),
  studentName: text(student.studentName || student.name),
  roomNumber: text(student.roomNumber || student.room),
  plan: text(student.plan),
  feeStatus: text(student.feeStatus),
  enrolled: text(student.enrolled),
});

const normalizeCharge = (charge) => ({
  _id: text(charge._id),
  plan: text(charge.plan),
  monthly: number(charge.monthly),
  desc: text(charge.desc),
  status: text(charge.status),
});

const normalizeMenu = (menu) => ({
  _id: text(menu._id),
  day: text(menu.day),
  meals: menu.meals || {},
});

const weekDayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function MealAttendance({ attendance, students, loading, error, setError, refresh }) {
  const [form, setForm] = useState({ date: '', meal: 'Breakfast', present: '', total: '' });
  const avgPresent = attendance.length ? Math.round(attendance.reduce((sum, item) => sum + item.present, 0) / attendance.length) : 0;
  const avgAttendancePercent = attendance.length
    ? Math.round(attendance.reduce((sum, item) => sum + (item.total ? (item.present / item.total) * 100 : 0), 0) / attendance.length)
    : 0;
  const latestDate = attendance[0]?.date || '';

  const handleAdd = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await apiPost('/mess/attendance', {
        date: form.date,
        meal: form.meal,
        present: Number(form.present),
        total: Number(form.total || students.length),
      });
      setForm({ date: '', meal: 'Breakfast', present: '', total: '' });
      await refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div style={ui.pageTitle}>Meal Attendance</div>
      {error && <div style={{ ...ui.section, color: '#991b1b' }}>{error}</div>}
      <div style={ui.cardGrid}>
        {[
          { label: 'Total Students', val: students.length, color: '#1a3a5c' },
          { label: 'Avg. Present', val: avgPresent, color: '#065f46' },
          { label: 'Records Latest Day', val: attendance.filter((item) => item.date === latestDate).length, color: '#1e40af' },
          { label: 'Avg. Attendance %', val: avgAttendancePercent + '%', color: '#92400e' },
        ].map((card) => (
          <div key={card.label} style={ui.card(card.color)}>
            <div style={ui.cardLabel}>{card.label}</div>
            <div style={ui.cardValue}>{card.val}</div>
          </div>
        ))}
      </div>

      <div style={ui.section}>
        <div style={ui.sectionTitle}>Mark Attendance</div>
        <form onSubmit={handleAdd}>
          <div style={ui.formGrid}>
            <div>
              <label style={ui.label}>Date *</label>
              <input type="date" style={ui.input} value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
            </div>
            <div>
              <label style={ui.label}>Meal</label>
              <select style={ui.select} value={form.meal} onChange={(event) => setForm({ ...form, meal: event.target.value })}>
                {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((meal) => <option key={meal}>{meal}</option>)}
              </select>
            </div>
            <div>
              <label style={ui.label}>Present Count *</label>
              <input type="number" style={ui.input} value={form.present} onChange={(event) => setForm({ ...form, present: event.target.value })} min={0} required />
            </div>
            <div>
              <label style={ui.label}>Total Students</label>
              <input type="number" style={ui.input} value={form.total} onChange={(event) => setForm({ ...form, total: event.target.value })} placeholder={String(students.length)} />
            </div>
          </div>
          <button style={ui.btnPrimary} type="submit">Record Attendance</button>
        </form>
      </div>

      <div style={ui.section}>
        <div style={ui.sectionTitle}>Attendance Log</div>
        {loading ? <div style={ui.td}>Loading...</div> : (
          <table style={ui.table}>
            <thead>
              <tr>{['ID', 'Date', 'Meal', 'Present', 'Absent', 'Total', 'Attendance %'].map((header) => <th key={header} style={ui.th}>{header}</th>)}</tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? emptyRow('No records found', 7) : attendance.map((item) => (
                <tr key={item._id}>
                  <td style={{ ...ui.td, fontWeight: 700 }}>{item._id}</td>
                  <td style={ui.td}>{item.date}</td>
                  <td style={ui.td}><span style={ui.badge('blue')}>{item.meal}</span></td>
                  <td style={{ ...ui.td, color: '#065f46', fontWeight: 700 }}>{item.present}</td>
                  <td style={{ ...ui.td, color: '#991b1b', fontWeight: 700 }}>{item.absent}</td>
                  <td style={ui.td}>{item.total}</td>
                  <td style={ui.td}>{item.total ? Math.round((item.present / item.total) * 100) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function MessStudentList({ students, loading }) {
  const [search, setSearch] = useState('');
  const filtered = students.filter((student) => student.studentName.toLowerCase().includes(search.toLowerCase()) || student.studentId.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={ui.pageTitle}>Mess Student List</div>
      <div style={ui.cardGrid}>
        {[
          { label: 'Enrolled Students', val: students.length, color: '#1a3a5c' },
          { label: 'Full Board', val: students.filter((student) => student.plan === 'Full Board').length, color: '#065f46' },
          { label: 'Other Plans', val: students.filter((student) => student.plan && student.plan !== 'Full Board').length, color: '#1e40af' },
          { label: 'Fee Pending', val: students.filter((student) => student.feeStatus !== 'Paid').length, color: '#991b1b' },
        ].map((card) => (
          <div key={card.label} style={ui.card(card.color)}>
            <div style={ui.cardLabel}>{card.label}</div>
            <div style={ui.cardValue}>{card.val}</div>
          </div>
        ))}
      </div>
      <div style={ui.section}>
        <div style={ui.sectionTitle}>Enrolled Students</div>
        <div style={{ marginBottom: '14px' }}>
          <input style={{ ...ui.input, maxWidth: '300px' }} placeholder="Search by name or ID..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        {loading ? <div style={ui.td}>Loading...</div> : (
          <table style={ui.table}>
            <thead>
              <tr>{['Student ID', 'Name', 'Room', 'Mess Plan', 'Enrolled Since', 'Fee Status'].map((header) => <th key={header} style={ui.th}>{header}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? emptyRow('No records found', 6) : filtered.map((student) => (
                <tr key={student._id}>
                  <td style={{ ...ui.td, fontWeight: 700 }}>{student.studentId}</td>
                  <td style={ui.td}>{student.studentName}</td>
                  <td style={ui.td}>{student.roomNumber}</td>
                  <td style={ui.td}><span style={ui.badge('blue')}>{student.plan}</span></td>
                  <td style={ui.td}>{student.enrolled}</td>
                  <td style={ui.td}><span style={ui.badge(student.feeStatus === 'Paid' ? 'green' : student.feeStatus === 'Partial' ? 'yellow' : 'red')}>{student.feeStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function MessCharges({ charges, students, loading }) {
  const enrolledByPlan = useMemo(() => {
    const groups = {};
    students.forEach((student) => {
      groups[student.plan] = (groups[student.plan] || 0) + 1;
    });
    return groups;
  }, [students]);
  const totalMonthly = charges.reduce((sum, charge) => sum + (charge.monthly * (enrolledByPlan[charge.plan] || 0)), 0);

  return (
    <div>
      <div style={ui.pageTitle}>Mess Charges</div>
      <div style={ui.cardGrid}>
        {[
          { label: 'Total Monthly Revenue', val: 'Rs ' + totalMonthly.toLocaleString(), color: '#065f46' },
          { label: 'Active Plans', val: charges.filter((charge) => charge.status === 'Active').length, color: '#1a3a5c' },
          { label: 'Configured Plans', val: charges.length, color: '#1e40af' },
          { label: 'Enrolled Students', val: students.length, color: '#92400e' },
        ].map((card) => (
          <div key={card.label} style={ui.card(card.color)}>
            <div style={ui.cardLabel}>{card.label}</div>
            <div style={{ ...ui.cardValue, fontSize: text(card.val).length > 8 ? '18px' : '28px' }}>{card.val}</div>
          </div>
        ))}
      </div>

      <div style={ui.section}>
        <div style={ui.sectionTitle}>Mess Plans & Charges</div>
        {loading ? <div style={ui.td}>Loading...</div> : (
          <table style={ui.table}>
            <thead>
              <tr>{['Plan Name', 'Includes', 'Monthly Charge', 'Enrolled Students', 'Monthly Revenue'].map((header) => <th key={header} style={ui.th}>{header}</th>)}</tr>
            </thead>
            <tbody>
              {charges.length === 0 ? emptyRow('No records found', 5) : charges.map((charge) => {
                const enrolled = enrolledByPlan[charge.plan] || 0;
                return (
                  <tr key={charge._id}>
                    <td style={{ ...ui.td, fontWeight: 700 }}>{charge.plan}</td>
                    <td style={ui.td}>{charge.desc}</td>
                    <td style={{ ...ui.td, fontWeight: 700, color: '#065f46' }}>Rs {charge.monthly.toLocaleString()}</td>
                    <td style={ui.td}>{enrolled}</td>
                    <td style={{ ...ui.td, fontWeight: 700 }}>Rs {(charge.monthly * enrolled).toLocaleString()}</td>
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

const mealFields = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

function MessMenu({ menu, loading, error, setError, refresh }) {
  const [selectedDay, setSelectedDay] = useState('');
  const days = menu.map((entry) => entry.day).filter(Boolean);
  const activeDay = selectedDay || days[0] || 'Monday';
  const selected = menu.find((entry) => entry.day === activeDay) || normalizeMenu({});
  const meals = selected.meals || {};
  const mealNames = mealFields.filter((mealName) => Object.prototype.hasOwnProperty.call(meals, mealName));
  const breakfastItems = asArray(meals.Breakfast).join('\n');
  const lunchItems = asArray(meals.Lunch).join('\n');
  const snacksItems = asArray(meals.Snacks).join('\n');
  const dinnerItems = asArray(meals.Dinner).join('\n');
  const [form, setForm] = useState({
    day: 'Monday',
    Breakfast: '',
    Lunch: '',
    Snacks: '',
    Dinner: '',
  });

  useEffect(() => {
    setForm({
      day: activeDay,
      Breakfast: breakfastItems,
      Lunch: lunchItems,
      Snacks: snacksItems,
      Dinner: dinnerItems,
    });
  }, [activeDay, breakfastItems, lunchItems, snacksItems, dinnerItems]);

  const handleSave = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const payload = {
        day: form.day,
        meals: mealFields.reduce((acc, mealName) => {
          acc[mealName] = form[mealName].split('\n').map((item) => item.trim()).filter(Boolean);
          return acc;
        }, {}),
      };
      await apiPost('/mess/menu', payload);
      setSelectedDay(form.day);
      await refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div style={ui.pageTitle}>Mess Menu</div>
      <div style={ui.cardGrid}>
        {[
          { label: 'Meal Sessions / Day', val: mealNames.length, color: '#1a3a5c' },
          { label: 'Menu Days', val: days.length, color: '#92400e' },
          { label: 'Selected Day', val: activeDay, color: '#065f46' },
          { label: 'Menu Items', val: mealNames.reduce((sum, mealName) => sum + asArray(meals[mealName]).length, 0), color: '#1e40af' },
        ].map((card) => (
          <div key={card.label} style={ui.card(card.color)}>
            <div style={ui.cardLabel}>{card.label}</div>
            <div style={{ ...ui.cardValue, fontSize: text(card.val).length > 8 ? '20px' : '28px' }}>{card.val}</div>
          </div>
        ))}
      </div>

      <div style={ui.section}>
        <div style={ui.sectionTitle}>Add or Change Menu</div>
        {error && <div style={{ color: '#991b1b', marginBottom: '12px', fontSize: '13.5px', fontWeight: 600 }}>{error}</div>}
        <form onSubmit={handleSave}>
          <div style={ui.formGrid}>
            <div>
              <label style={ui.label}>Day</label>
              <select style={ui.select} value={form.day} onChange={(event) => setForm({ ...form, day: event.target.value })}>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => <option key={day}>{day}</option>)}
              </select>
            </div>
            {mealFields.map((mealName) => (
              <div key={mealName}>
                <label style={ui.label}>{mealName} Items</label>
                <textarea
                  style={ui.textarea}
                  value={form[mealName]}
                  onChange={(event) => setForm({ ...form, [mealName]: event.target.value })}
                  placeholder={`One ${mealName.toLowerCase()} item per line`}
                />
              </div>
            ))}
          </div>
          <button style={ui.btnPrimary} type="submit">Save Menu</button>
        </form>
      </div>

      <div style={ui.section}>
        <div style={ui.sectionTitle}>Weekly Menu</div>
        {loading ? <div style={ui.td}>Loading...</div> : days.length === 0 ? <div style={ui.td}>No records found</div> : (
          <>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {days.map((day) => (
                <button key={day} onClick={() => setSelectedDay(day)} style={{
                  padding: '7px 14px', borderRadius: '4px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none',
                  backgroundColor: activeDay === day ? '#1a3a5c' : '#e5e7eb',
                  color: activeDay === day ? '#fff' : '#374151',
                }}>{day}</button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {mealNames.map((mealName) => (
                <div key={mealName} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: '#1a3a5c', color: '#fff', padding: '10px 14px', fontWeight: 700, fontSize: '14px' }}>
                    {mealName}
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    {asArray(meals[mealName]).length === 0 ? <div style={{ fontSize: '13.5px', color: '#6b7280' }}>No records found</div> : asArray(meals[mealName]).map((item) => (
                      <div key={`${mealName}-${item}`} style={{ padding: '5px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13.5px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#1a3a5c', fontSize: '10px' }}>-</span> {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const MENU = [
  { key: 'attendance', label: 'Meal Attendance', icon: 'Att' },
  { key: 'students', label: 'Mess Student List', icon: 'Stu' },
  { key: 'charges', label: 'Mess Charges', icon: 'Fee' },
  { key: 'menu', label: 'Mess Menu', icon: 'Menu' },
];

export default function MessDashboard() {
  const [page, setPage] = useState('attendance');
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [charges, setCharges] = useState([]);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await apiGet('/mess');
      setAttendance(asArray(data.attendance).map(normalizeAttendance));
      setStudents(asArray(data.students).map(normalizeStudent));
      setCharges(asArray(data.charges).map(normalizeCharge));
      setMenu(asArray(data.menu).map(normalizeMenu).sort((a, b) => weekDayOrder.indexOf(a.day) - weekDayOrder.indexOf(b.day)));
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
    attendance: <MealAttendance attendance={attendance} students={students} loading={loading} error={error} setError={setError} refresh={refresh} />,
    students: <MessStudentList students={students} loading={loading} />,
    charges: <MessCharges charges={charges} students={students} loading={loading} />,
    menu: <MessMenu menu={menu} loading={loading} error={error} setError={setError} refresh={refresh} />,
  };

  return (
    <DashboardLayout role="Mess Staff" menuItems={MENU} activePage={page} onPageChange={setPage}>
      {error && page !== 'attendance' && <div style={{ ...ui.section, color: '#991b1b' }}>{error}</div>}
      {pageContent[page] || pageContent.attendance}
    </DashboardLayout>
  );
}
