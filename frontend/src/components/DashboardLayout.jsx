import React from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#f0f2f5',
    color: '#1a1a2e',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a3a5c',
    color: '#fff',
    padding: '0 24px',
    height: '56px',
    flexShrink: 0,
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    zIndex: 100,
  },
  topBarTitle: {
    fontSize: '18px',
    fontWeight: '700',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userBadge: {
    fontSize: '13px',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: '4px 12px',
    borderRadius: '20px',
  },
  logoutBtn: {
    backgroundColor: '#c0392b',
    color: '#fff',
    border: 'none',
    padding: '6px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  sidebar: {
    width: '220px',
    backgroundColor: '#0f2540',
    color: '#c8d8e8',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    paddingBottom: '24px',
  },
  sidebarRoleBox: {
    padding: '16px',
    backgroundColor: '#0a1e35',
    borderBottom: '1px solid #1e3d5f',
  },
  sidebarRoleLabel: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: '#6a9bc3',
    marginBottom: '4px',
  },
  sidebarRoleName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#e8f0f8',
  },
  sidebarSection: {
    padding: '16px 0 4px',
  },
  sidebarSectionLabel: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: '#4a7a9b',
    padding: '0 16px',
    marginBottom: '4px',
  },
  sidebarItem: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    cursor: 'pointer',
    fontSize: '13.5px',
    color: active ? '#fff' : '#9bb8d0',
    backgroundColor: active ? '#1a6fa8' : 'transparent',
    borderLeft: active ? '3px solid #4db6f5' : '3px solid transparent',
    transition: 'all 0.15s',
    userSelect: 'none',
  }),
  sidebarSubItem: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 16px 8px 34px',
    cursor: 'pointer',
    fontSize: '13px',
    color: active ? '#fff' : '#8aadc5',
    backgroundColor: active ? '#154d78' : 'transparent',
    borderLeft: active ? '3px solid #4db6f5' : '3px solid transparent',
    transition: 'all 0.15s',
  }),
  main: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    backgroundColor: '#f0f2f5',
  },
};

export default function DashboardLayout({ role, menuItems, activePage, onPageChange, children }) {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div style={styles.root}>
      {/* TOP BAR */}
      <div style={styles.topBar}>
        <div style={styles.topBarTitle}>
          <span style={{ fontSize: '22px' }}>🏢</span>
          Hostel Management System
        </div>
        <div style={styles.topBarRight}>
          <span style={styles.userBadge}>👤 {user.username || 'User'}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.body}>
        {/* SIDEBAR */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarRoleBox}>
            <div style={styles.sidebarRoleLabel}>Logged in as</div>
            <div style={styles.sidebarRoleName}>{role}</div>
          </div>

          <div style={styles.sidebarSection}>
            <div style={styles.sidebarSectionLabel}>Navigation</div>
            {menuItems.map((item) =>
              item.children ? (
                <div key={item.key}>
                  <div style={{ ...styles.sidebarItem(false), cursor: 'default' }}>
                    <span>{item.icon}</span> {item.label}
                  </div>
                  {item.children.map((child) => (
                    <div
                      key={child.key}
                      style={styles.sidebarSubItem(activePage === child.key)}
                      onClick={() => onPageChange(child.key)}
                    >
                      <span>{child.icon}</span> {child.label}
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  key={item.key}
                  style={styles.sidebarItem(activePage === item.key)}
                  onClick={() => onPageChange(item.key)}
                >
                  <span>{item.icon}</span> {item.label}
                </div>
              )
            )}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={styles.main}>{children}</div>
      </div>
    </div>
  );
}
