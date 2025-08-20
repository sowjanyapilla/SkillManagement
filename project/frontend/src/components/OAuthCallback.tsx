import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '../types';

interface OAuthCallbackProps {
  onLogin: (user: User) => void;
}

export default function OAuthCallback({ onLogin }: OAuthCallbackProps) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleLogin = async () => {
      try {
        const query = new URLSearchParams(location.search);
        const token = query.get('token');
        const email = query.get('email');
        const name = query.get('name');
        const idParam = query.get('id');

        if (token && email && name && idParam) {
          // OPTIONAL: Verify token with backend before proceeding
          // const response = await fetch(`/api/verify?token=${token}`);
          // const isValid = await response.json();
          // if (!isValid) throw new Error("Invalid token");

          const user: User = {
            id: parseInt(idParam, 10),
            email,
            name,
            avatar_url: '', // optional, can be fetched from backend
            is_manager: false, // or decode from token if included
            created_at: new Date().toISOString(),
          };

          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('token', token);
          onLogin(user);

          navigate('/dashboard');
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error("OAuth login failed:", error);
        navigate('/');
      }
    };

    handleLogin();
  }, [location, onLogin, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-700 text-lg">Logging you in...</p>
    </div>
  );
}
