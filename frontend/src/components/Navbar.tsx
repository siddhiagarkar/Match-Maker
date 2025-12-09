// components/Navbar.tsx
import React from 'react';
import Button from './Button'; // optional – or use plain <Button>
import API from '../api';

type NavbarProps = {
  onDashboard?: () => void;
  onChat?: () => void;
  onLogout?: () => void;
  userName?: string;
  userInitials?: string;
  online?: boolean;
};

const Navbar: React.FC<NavbarProps> = ({
  onLogout,
  userName = 'Current User',
  userInitials = 'CU',
  online = true,
}) => {
  function onChat(): void {
    throw new Error('Function not implemented.');
  }

  const handleLogout = async () => {
  try {
    await API.post('/auth/logout'); // backend cleanup
    localStorage.removeItem('user');
    setUser(null);
    console.log('clicked')
    console.log('Logout successful I think.');
  } catch (err) {
    console.error('Logout failed, clearing local state anyway', err);
    localStorage.removeItem('user');
    setUser(null);
  } finally {
    window.location.href = '/login'; // redirect to login page
  }
};


  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: '#ffffffee',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0.6rem 1.4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* LEFT: logo + nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* App logo circle */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              background: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            TS
          </div>

          {/* Brand + nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            {/* <span style={{ fontSize: 22, fontWeight: 600, color: '#020617' }}>
              Ticket System
            </span> */}

            {/* Dashboard pill */}
            {/* <Button
              onClick={onDashboard ?? (() => {})}
              style={{
                border: 'none',
                borderRadius: 999,
                padding: '0.45rem 1.4rem',
                background: '#2563eb',
                color: '#fff',
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37,99,235,0.35)',
              }}
            >
              Dashboard
            </Button> */}

            {/* Chat text link */}
            {/* <Button
              onClick={onChat ?? (() => {})}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: 16,
                color: '#111827',
                cursor: 'pointer',
              }}
            >
              Chat
            </Button> */}
          </div>
        </div>

        {/* RIGHT: status + user + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Online pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '0.4rem 0.9rem',
              borderRadius: 999,
              border: '1px solid #bbf7d0',
              background: '#ecfdf3',
              fontSize: 14,
              color: '#15803d',
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '999px',
                background: online ? '#22c55e' : '#9ca3af',
              }}
            />
            {online ? 'Online' : 'Offline'}
          </div>

          {/* Break pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '0.4rem 0.9rem',
              borderRadius: 999,
              border: '1px solid #f7f3bbff',
              background: '#fdfbecff',
              fontSize: 14,
              color: '#c8b315ff',
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '999px',
                background: online ? '#c5c022ff' : '#9ca3af',
              }}
            />
            {online ? 'Take a break' : 'On break'}
          </div>

          {/* User pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '0.4rem 1rem',
              borderRadius: 999,
              border: '1px solid #e5e7eb',
              background: '#fff',
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '999px',
                background: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 600,
                color: '#1d4ed8',
              }}
            >
              {userInitials}
            </div>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>
              {userName}
            </span>
          </div>

          {/* Logout pill */}
          <Button
            onClick={() => {
              console.log('Logout button clicked (raw)');
              handleLogout();
            }}
    
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '0.45rem 1.1rem',
              borderRadius: 999,
              border: '1px solid #fecaca',
              background: '#fef2f2',
              color: '#b91c1c',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
function setUser(arg0: null) {
  throw new Error('Function not implemented.');
}

