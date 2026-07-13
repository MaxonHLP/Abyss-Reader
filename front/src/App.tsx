import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import MasterDashboard from './pages/MasterDashboard';
import GroupDetails from './pages/GroupDetails';
import Groups from './pages/Groups';
import Catalog from './pages/Catalog';
import Work from './pages/Work';
import ChapterReader from './pages/ChapterReader';
import UserProfile from './pages/UserProfile';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import DemoProtectionModal from './components/modales/DemoProtectionModal';
import DemoToastContainer from './components/DemoToastContainer';

function App() {
  return (
    <BrowserRouter>
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
      </Routes>

      {/* Modal global para protección de demo */}
      <DemoProtectionModal />
      <DemoToastContainer />
    </BrowserRouter>
  );
}

export default App;
