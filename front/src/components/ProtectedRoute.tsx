import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface ProtectedRouteProps {
  requiredRole?: string;
  allowedRoles?: string[];
  redirectTo?: string;
}

const ProtectedRoute = ({ requiredRole, allowedRoles, redirectTo = "/login" }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    // Si el usuario no está autenticado, lo enviamos a la ruta de redirección por defecto (login)
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole && user?.rol !== requiredRole) {
    // Si la ruta requiere un rol específico y el usuario no lo tiene, lo mandamos al home o a una página de no autorizado
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && (!user?.rol || !allowedRoles.includes(user.rol))) {
    return <Navigate to="/" replace />;
  }

  // Si pasa las validaciones, renderizamos las rutas hijas
  return <Outlet />;
};

export default ProtectedRoute;
