/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Trash2, Plus, LogOut, ShoppingBag, Utensils, 
  Users, Settings, Save, UserCircle, X, CheckCircle, RefreshCw 
} from 'lucide-react';

import '../App.css';

const Admin = () => {
  const [view, setView] = useState('pedidos'); 
  const [produtos, setProdutos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({ usuario: '', senha: '' });
  const [novoMembro, setNovoMembro] = useState({ usuario: '', senha: '' });
  const [novoProduto, setNovoProduto] = useState({ name: '', price: '', category: 'Lanches', image: '🍔', prepTime: 20 });

  useEffect(() => {
    carregarDados();
  }, [view]);

  const carregarDados = async () => {
    try {
      if (view === 'pedidos') {
        const res = await api.get('/admin/pedidos');
        setPedidos(res.data);
      } else if (view === 'cardapio') {
        const res = await api.get('/menu');
        setProdutos(res.data);
      } else if (view === 'equipe') {
        const res = await api.get('/admin/usuarios');
        setUsuarios(res.data);
      }
    } catch (err) {
      console.error("Erro ao carregar dados", err);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/login';
  };

  const deletarPedido = async (id) => {
    try {
      await api.delete(`/admin/pedidos/${id}`);
      setPedidos(pedidos.filter(p => p.id !== id));
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Erro ao finalizar pedido.");
    }
  };

  const handleAddProduto = async (e) => {
    e.preventDefault();
    await api.post('/produtos', novoProduto);
    setNovoProduto({ name: '', price: '', category: 'Lanches', image: '🍔', prepTime: 20 });
    carregarDados();
  };

  const deletarProduto = async (id) => {
    if(window.confirm("Deseja excluir este item?")) {
      await api.delete(`/produtos/${id}`);
      carregarDados();
    }
  };

  const handleAddMembro = async (e) => {
    e.preventDefault();
    await api.post('/admin/usuarios', novoMembro);
    setNovoMembro({ usuario: '', senha: '' });
    carregarDados();
    alert("Membro adicionado!");
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/admin/perfil', profileData);
      alert("Perfil atualizado! Faça login novamente.");
      logout();
    // eslint-disable-next-line no-unused-vars
    } catch (err) { alert("Erro ao atualizar perfil."); }
  };

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Utensils color="#2ecc71" size={32} />
          <span>Painel Admin</span>
        </div>
        
        <nav className="admin-nav-menu">
          <button className={view === 'pedidos' ? 'active' : ''} onClick={() => setView('pedidos')}>
            <ShoppingBag size={20}/> <span>Pedidos</span>
          </button>
          <button className={view === 'cardapio' ? 'active' : ''} onClick={() => setView('cardapio')}>
            <Utensils size={20}/> <span>Cardápio</span>
          </button>
          <button className={view === 'equipe' ? 'active' : ''} onClick={() => setView('equipe')}>
            <Users size={20}/> <span>Equipe</span>
          </button>
        </nav>

        <div className="admin-footer-nav" style={{marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px'}}>
          <button onClick={() => setIsProfileModalOpen(true)} className="btn-settings" style={{background: 'rgba(255,255,255,0.05)', color: '#94a3b8'}}>
            <Settings size={20}/> <span>Configurações</span>
          </button>
          <button onClick={logout} className="btn-logout" style={{background: '#e74c3c', color: 'white'}}>
            <LogOut size={20}/> <span>Sair</span>
          </button>
        </div>
      </aside>

      <main className="admin-main-content">
        {view === 'pedidos' && (
          <section className="admin-section">
            <header className="section-header" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
              <h2>Pedidos em Tempo Real</h2>
              <button onClick={carregarDados} className="btn-primary"><RefreshCw size={16}/> Atualizar</button>
            </header>
            
            <div className="orders-list"> {/* A CLASSE QUE EMPILHA OS PEDIDOS */}
              {pedidos.length === 0 ? <p>Nenhum pedido pendente.</p> : pedidos.map(p => (
                <div key={p.id} className="order-card">
                  <div className="order-info">
                    <h3>Pedido #{p.id} - <span style={{color: '#27ae60'}}>{p.customerName}</span></h3>
                    <strong>R$ {p.total.toFixed(2)}</strong>
                  </div>
                  <div className="order-items" style={{margin: '15px 0', padding: '10px', background: '#f8fafc', borderRadius: '8px'}}>
                    {JSON.parse(p.items).map((it, i) => (
                      <p key={i} style={{fontSize: '14px'}}>• {it.quantity}x {it.name}</p>
                    ))}
                  </div>
                  <button onClick={() => deletarPedido(p.id)} className="complete-btn">
                    <CheckCircle size={18}/> Concluir Pedido
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {view === 'cardapio' && (
          <section className="admin-section">
            <header className="section-header"><h2>Gerenciar Cardápio</h2></header>
            <form onSubmit={handleAddProduto} className="admin-form" style={{background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '30px'}}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '15px', alignItems: 'end'}}>
                <div>
                  <label>Nome do Item</label>
                  <input type="text" value={novoProduto.name} onChange={e => setNovoProduto({...novoProduto, name: e.target.value})} required />
                </div>
                <div>
                  <label>Preço (R$)</label>
                  <input type="number" step="0.01" value={novoProduto.price} onChange={e => setNovoProduto({...novoProduto, price: e.target.value})} required />
                </div>
                <button type="submit" className="add-btn" style={{height: '48px', marginBottom: '16px'}}>Adicionar</button>
              </div>
            </form>

            <div className="products-grid">
              {produtos.map(prod => (
                <div key={prod.id} className="product-card">
                  <span className="product-emoji">{prod.image}</span>
                  <h4>{prod.name}</h4>
                  <p className="price">R$ {prod.price.toFixed(2)}</p>
                  <button onClick={() => deletarProduto(prod.id)} className="delete-btn" style={{color: '#e74c3c', background: 'none'}}><Trash2 size={20}/></button>
                </div>
              ))}
            </div>
          </section>
        )}

        {view === 'equipe' && (
          <section className="admin-section">
            <header className="section-header"><h2>Equipe Administrativa</h2></header>
            <div className="order-card" style={{marginBottom: '20px'}}>
              <form onSubmit={handleAddMembro} className="profile-form">
                <input type="text" placeholder="Login do novo membro" value={novoMembro.usuario} onChange={e => setNovoMembro({...novoMembro, usuario: e.target.value})} required />
                <input type="password" placeholder="Senha temporária" value={novoMembro.senha} onChange={e => setNovoMembro({...novoMembro, senha: e.target.value})} required />
                <button type="submit" className="btn-primary">Criar Acesso</button>
              </form>
            </div>
            <div className="orders-list">
              {usuarios.map(u => (
                <div key={u.id} className="order-card" style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftColor: '#34495e'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <UserCircle size={30} color="#94a3b8" />
                    <strong>{u.username}</strong>
                  </div>
                  <span className="badge">Ativo</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {isProfileModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-x" onClick={() => setIsProfileModalOpen(false)}><X/></button>
            <h2 style={{marginBottom: '20px'}}>Meus Dados</h2>
            <form onSubmit={handleUpdateProfile} className="profile-form">
              <label>Novo Nome de Usuário</label>
              <input type="text" placeholder="Usuário atual ou novo" onChange={e => setProfileData({...profileData, usuario: e.target.value})} required />
              <label>Nova Senha</label>
              <input type="password" placeholder="Mínimo 6 caracteres" onChange={e => setProfileData({...profileData, senha: e.target.value})} required />
              <button type="submit" className="save-btn" style={{marginTop: '10px'}}>Atualizar Perfil</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;