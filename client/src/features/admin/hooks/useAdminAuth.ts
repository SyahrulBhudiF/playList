import { useState, useEffect } from 'react';
import { socket } from '../../../shared/lib/socket';

export function useAdminAuth() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [user, setUser] = useState<{ id: string; username: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socket.connect();
    
    if (token) {
      socket.emit('admin_authenticate', { token }, (res: any) => {
        if (res.success) {
          setUser(res.user);
        } else {
          // Token invalid or expired
          setToken(null);
          setUser(null);
          localStorage.removeItem('adminToken');
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (newToken: string, newUser: { id: string; username: string; email: string; role: string }) => {
    localStorage.setItem('adminToken', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setUser(null);
  };

  return { token, user, loading, login, logout };
}
