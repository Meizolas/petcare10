import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function UserRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && isAdmin) {
      toast({
        title: 'Acesso Restrito',
        description: 'Área exclusiva para usuários. Admins não têm acesso.',
        variant: 'destructive',
      });
      navigate('/admin');
    }
  }, [user, isAdmin, navigate, toast]);

  if (user && isAdmin) {
    return null;
  }

  return <>{children}</>;
}
