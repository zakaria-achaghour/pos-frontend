import { useEffect } from 'react';
import { useNavigate } from 'react-router';

const OwnerLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

  return null;
};

export default OwnerLogin;
