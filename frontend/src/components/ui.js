/* Shared UI utility styles for all dashboard pages */

export const card = (color = '#1a3a5c') => ({
  backgroundColor: '#fff',
  borderRadius: '6px',
  padding: '20px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  borderTop: `3px solid ${color}`,
  minWidth: '0',
});

export const cardGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: '16px',
  marginBottom: '24px',
};

export const cardLabel = {
  fontSize: '11px',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
  color: '#6b7280',
  marginBottom: '6px',
};

export const cardValue = {
  fontSize: '28px',
  fontWeight: '800',
  color: '#1a1a2e',
  lineHeight: 1,
};

export const cardSub = {
  fontSize: '12px',
  color: '#9ca3af',
  marginTop: '4px',
};

export const section = {
  backgroundColor: '#fff',
  borderRadius: '6px',
  padding: '20px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  marginBottom: '24px',
};

export const sectionTitle = {
  fontSize: '15px',
  fontWeight: '700',
  color: '#1a1a2e',
  marginBottom: '16px',
  paddingBottom: '10px',
  borderBottom: '1px solid #e5e7eb',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

export const table = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '13.5px',
};

export const th = {
  textAlign: 'left',
  padding: '10px 12px',
  backgroundColor: '#f1f5f9',
  color: '#374151',
  fontWeight: '700',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: '2px solid #e2e8f0',
};

export const td = {
  padding: '10px 12px',
  borderBottom: '1px solid #f1f5f9',
  color: '#374151',
  verticalAlign: 'middle',
};

export const badge = (color) => ({
  display: 'inline-block',
  padding: '2px 10px',
  borderRadius: '12px',
  fontSize: '11px',
  fontWeight: '700',
  backgroundColor: color === 'green' ? '#d1fae5' : color === 'red' ? '#fee2e2' : color === 'blue' ? '#dbeafe' : '#fef3c7',
  color: color === 'green' ? '#065f46' : color === 'red' ? '#991b1b' : color === 'blue' ? '#1e40af' : '#92400e',
});

export const formGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: '16px',
  marginBottom: '16px',
};

export const label = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '5px',
  textTransform: 'uppercase',
  letterSpacing: '0.3px',
};

export const input = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  fontSize: '13.5px',
  color: '#1f2937',
  boxSizing: 'border-box',
  backgroundColor: '#f9fafb',
};

export const select = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  fontSize: '13.5px',
  color: '#1f2937',
  boxSizing: 'border-box',
  backgroundColor: '#f9fafb',
  cursor: 'pointer',
};

export const textarea = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  fontSize: '13.5px',
  color: '#1f2937',
  boxSizing: 'border-box',
  backgroundColor: '#f9fafb',
  resize: 'vertical',
  minHeight: '80px',
};

export const btnPrimary = {
  backgroundColor: '#1a3a5c',
  color: '#fff',
  border: 'none',
  padding: '9px 20px',
  borderRadius: '4px',
  fontSize: '13px',
  fontWeight: '700',
  cursor: 'pointer',
};

export const btnSuccess = {
  backgroundColor: '#065f46',
  color: '#fff',
  border: 'none',
  padding: '6px 14px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: '600',
  cursor: 'pointer',
};

export const btnDanger = {
  backgroundColor: '#991b1b',
  color: '#fff',
  border: 'none',
  padding: '6px 14px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: '600',
  cursor: 'pointer',
};

export const pageTitle = {
  fontSize: '20px',
  fontWeight: '800',
  color: '#1a1a2e',
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};
