import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Lock, User, LogIn } from 'lucide-react';
import '../App.css';

const Login = () => {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await api.post('/login', { usuario, senha });
    if (res.data.status === 'sucesso') {
      localStorage.setItem('adminToken', res.data.token);
      navigate('/admin');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Painel Administrativo</h1>

        <form onSubmit={handleLogin} className="login-form">
          <label>Usuário</label>
          <input value={usuario} onChange={e => setUsuario(e.target.value)} />

          <label>Senha</label>
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)} />

          <button className="btn btn-primary">
            <LogIn size={18} /> Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
