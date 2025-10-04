import { useEffect } from 'react';
import { useNavigate } from 'react-router';

const ManagerLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

  return null;
};

export default ManagerLogin;
