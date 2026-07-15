import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DemoProtectionModal from './components/modales/DemoProtectionModal';
import DemoToastContainer from './components/DemoToastContainer';

// --- Code Splitting: Carga diferida de vistas (Lazy Loading) ---
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Catalog = React.lazy(() => import('./pages/Catalog'));
const Work = React.lazy(() => import('./pages/Work'));
const ChapterReader = React.lazy(() => import('./pages/ChapterReader'));
const Groups = React.lazy(() => import('./pages/Groups'));
const GroupDetails = React.lazy(() => import('./pages/GroupDetails'));
const UserProfile = React.lazy(() => import('./pages/UserProfile'));
const MasterDashboard = React.lazy(() => import('./pages/MasterDashboard'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Spinner de fallback mientras cargan los chunks
const LoadingFallback = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-gray-950">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/biblioteca" element={<Catalog />} />
          <Route path="/obra/:obraNombre" element={<Work />} />
          <Route path="/obra/:obraNombre/capitulo/:numero" element={<ChapterReader />} />
          <Route path="/grupos" element={<Groups />} />
          <Route path="/grupos/:id" element={<GroupDetails />} />
          
          {/* Rutas Protegidas - General (cualquier usuario autenticado) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/perfil" element={<UserProfile />} />
          </Route>

          {/* Rutas Protegidas - Administrativas (Rol: MASTER) */}
          <Route element={<ProtectedRoute requiredRole="MASTER" />}>
            <Route path="/master" element={<MasterDashboard />} />
          </Route>

          {/* Ruta por defecto (404) */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      {/* Modal global para protección de demo */}
      <DemoProtectionModal />
      <DemoToastContainer />
    </BrowserRouter>
  );
}

export default App;
