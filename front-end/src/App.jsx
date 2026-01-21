import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importação das páginas que criamos
import Menu from './pages/Menu';
import Login from './pages/Login';
import Admin from './pages/Admin';
import './App.css';

/**
 * Componente de Proteção de Rota (PrivateRoute)
 * Ele verifica se existe um 'adminToken' no localStorage.
 * Se não existir, redireciona o usuário para a tela de login.
 */
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('adminToken');
  
  if (!isAuthenticated) {
    // Se não estiver logado, manda para o login
    return <Navigate to="/login" replace />;
  }

  // Se estiver logado, permite ver a página Admin
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* ROTA PÚBLICA: Cardápio para os clientes */}
        <Route path="/" element={<Menu />} />

        {/* ROTA DE ACESSO: Tela de login para o gerente */}
        <Route path="/login" element={<Login />} />

        {/* ROTA PROTEGIDA: Painel administrativo com abas e equipe */}
        <Route 
          path="/admin" 
          element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          } 
        />

        {/* ROTA DE SEGURANÇA: Qualquer URL errada volta para o Menu */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;