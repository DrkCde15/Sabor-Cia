import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Lock, User, LogIn, AlertCircle } from 'lucide-react';
import '../App.css';

const Login = () => {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      // Envia os dados para a rota /login do seu FastAPI
      const response = await api.post('/login', {
        usuario: usuario,
        senha: senha
      });

      if (response.data.status === 'sucesso') {
        // Salva o token para o PrivateRoute permitir o acesso
        localStorage.setItem('adminToken', response.data.token);
        
        // Redireciona para o painel administrativo
        navigate('/admin');
      }
    } catch (err) {
      // Trata erros de senha incorreta ou servidor fora do ar
      const mensagemErro = err.response?.data?.detail || "Erro ao conectar com o servidor.";
      setErro(mensagemErro);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="icon-circle">
            <Lock size={32} color="#fff" />
          </div>
          <h2>Painel Administrativo</h2>
          <p>Entre com suas credenciais para gerenciar o restaurante</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {erro && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{erro}</span>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="user">Usuário</label>
            <div className="input-wrapper">
              <User size={20} className="input-icon" />
              <input
                id="user"
                type="text"
                placeholder="Ex: admin"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="pass">Senha</label>
            <div className="input-wrapper">
              <Lock size={20} className="input-icon" />
              <input
                id="pass"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={carregando}>
            {carregando ? "Autenticando..." : (
              <>
                <LogIn size={20} /> Entrar no Painel
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>© 2026 Sabor & Cia - Sistema de Gestão</p>
        </div>
      </div>
    </div>
  );
};

export default Login;