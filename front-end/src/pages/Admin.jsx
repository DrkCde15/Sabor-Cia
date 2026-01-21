/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  ClipboardList, Package, Users, Settings, Plus, Trash2, LogOut,
  LayoutDashboard, CheckCircle2, X, Upload, UserPlus, Key, RefreshCw
} from 'lucide-react';
import api from '../services/api';
import '../App.css';

function Admin() {
  const [aba, setAba] = useState('pedidos');
  const [produtos, setProdutos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [equipe, setEquipe] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModalEquipe, setShowModalEquipe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados dos Formulários
  const [novoProd, setNovoProd] = useState({ name: '', price: '', category: 'Lanches', prepTime: '', image: null });
  const [novoMembro, setNovoMembro] = useState({ nome: '', cargo: '', turno: 'Diurno' });
  const [config, setConfig] = useState({ username: '', password: '', confirmPassword: '' });

  // 1. CARREGAMENTO INICIAL
  useEffect(() => {
    carregarDados();
    const intervalo = setInterval(carregarPedidos, 30000); // Auto-refresh pedidos
    return () => clearInterval(intervalo);
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [resProd, resPed, resEquipe] = await Promise.all([
        api.get('/menu'),
        api.get('/admin/pedidos'),
        api.get('/admin/equipe').catch(() => ({ data: [] })) // Fallback se rota não existir
      ]);
      setProdutos(resProd.data);
      setPedidos(resPed.data);
      setEquipe(resEquipe.data);
    } catch (err) {
      console.error("Erro ao carregar dados do sistema:", err);
    } finally {
      setLoading(false);
    }
  };

  const carregarPedidos = async () => {
    try {
      const res = await api.get('/admin/pedidos');
      setPedidos(res.data);
    } catch (err) {
      console.error("Erro ao atualizar pedidos");
    }
  };

  // --- 2. AÇÕES DE PRODUTOS ---
  const handleSalvarProduto = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', novoProd.name);
    formData.append('price', novoProd.price);
    formData.append('category', novoProd.category);
    formData.append('prepTime', novoProd.prepTime);
    formData.append('image', novoProd.image);

    try {
      await api.post('/produtos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowModal(false);
      setNovoProd({ name: '', price: '', category: 'Lanches', prepTime: '', image: null });
      carregarDados(); // Recarrega a lista
    } catch (err) { alert("Erro ao salvar produto. Verifique o backend."); }
  };

  const excluirProduto = async (id) => {
    if (window.confirm("Excluir este produto permanentemente?")) {
      try {
        await api.delete(`/produtos/${id}`);
        setProdutos(produtos.filter(p => p.id !== id));
      } catch (err) { alert("Erro ao excluir."); }
    }
  };

  // --- 3. AÇÕES DE EQUIPE ---
  const handleSalvarEquipe = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/equipe', novoMembro);
      setEquipe([...equipe, res.data]);
      setShowModalEquipe(false);
      setNovoMembro({ nome: '', cargo: '', turno: 'Diurno' });
    } catch (err) { alert("Erro ao cadastrar funcionário"); }
  };

  const excluirMembro = async (id) => {
    if (window.confirm("Remover da equipe?")) {
      try {
        await api.delete(`/admin/equipe/${id}`);
        setEquipe(equipe.filter(m => m.id !== id));
      } catch (err) { alert("Erro ao remover."); }
    }
  };

  // --- 4. AÇÕES DE CONFIGURAÇÃO ---
  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    if (config.password !== config.confirmPassword) return alert("As senhas não coincidem!");
    try {
      await api.put('/admin/update-access', { username: config.username, password: config.password });
      alert("Acesso atualizado com sucesso!");
      setConfig({ username: '', password: '', confirmPassword: '' });
    } catch (err) { alert("Erro ao atualizar login."); }
  };

  // --- 5. AÇÕES DE PEDIDOS ---
  const concluirPedido = async (id) => {
    try {
      await api.delete(`/admin/pedidos/${id}`);
      setPedidos(pedidos.filter(p => p.id !== id));
    } catch (err) { alert("Erro ao concluir pedido."); }
  };

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <LayoutDashboard /> <span>Sabor <strong>& Cia</strong></span>
        </div>
        <nav className="admin-nav-menu">
          <button className={aba === 'pedidos' ? 'active' : ''} onClick={() => setAba('pedidos')}><ClipboardList /> <span>Pedidos</span></button>
          <button className={aba === 'produtos' ? 'active' : ''} onClick={() => setAba('produtos')}><Package /> <span>Produtos</span></button>
          <button className={aba === 'equipe' ? 'active' : ''} onClick={() => setAba('equipe')}><Users /> <span>Equipe</span></button>
          <button className={aba === 'config' ? 'active' : ''} onClick={() => setAba('config')}><Settings /> <span>Configurações</span></button>
        </nav>
        <button className="btn btn-ghost" onClick={() => window.location.href = '/'}><LogOut /> <span>Sair</span></button>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="admin-main-content">
        
        {/* ABA PEDIDOS */}
        {aba === 'pedidos' && (
          <div className="admin-orders-section">
            <div className="admin-products-header">
              <h2>Pedidos em Aberto</h2>
              <button className="btn btn-secondary" onClick={carregarPedidos}><RefreshCw size={16} /> Atualizar</button>
            </div>
            <div className="admin-orders-list">
              {pedidos.map(p => (
                <div key={p.id} className="admin-order-card">
                  <div className="order-info">
                    <span className="order-id">#{p.id}</span>
                    <strong>{p.customerName}</strong>
                    <p className="order-items">{p.items}</p>
                    <span className="price-value">R$ {Number(p.total).toFixed(2)}</span>
                  </div>
                  <button className="btn-complete" onClick={() => concluirPedido(p.id)}>
                    <CheckCircle2 size={18}/> Concluir
                  </button>
                </div>
              ))}
              {pedidos.length === 0 && <p className="empty-msg">Nenhum pedido pendente no momento.</p>}
            </div>
          </div>
        )}

        {/* ABA PRODUTOS */}
        {aba === 'produtos' && (
          <>
            <div className="admin-products-header">
              <h2>Gestão de Menu</h2>
              <button className="btn btn-secondary" onClick={() => setShowModal(true)}><Plus size={16} /> Novo Produto</button>
            </div>
            <div className="admin-products-list">
              {produtos.map(p => (
                <div key={p.id} className="admin-product-item">
                  <img src={p.image.startsWith('http') ? p.image : `http://localhost:8000${p.image}`} className="admin-prod-thumb" alt="" />
                  <div style={{flex: 1}}>
                    <strong>{p.name}</strong>
                    <p style={{fontSize: '13px', color: '#64748b'}}>{p.category}</p>
                  </div>
                  <strong className="price-value">R$ {Number(p.price).toFixed(2)}</strong>
                  <button className="btn-delete" onClick={() => excluirProduto(p.id)}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ABA EQUIPE */}
        {aba === 'equipe' && (
          <>
            <div className="admin-products-header">
              <h2>Equipe de Trabalho</h2>
              <button className="btn btn-secondary" onClick={() => setShowModalEquipe(true)}><UserPlus size={16} /> Novo Membro</button>
            </div>
            <div className="admin-products-list">
              {equipe.map(m => (
                <div key={m.id} className="admin-product-item">
                  <div className="user-avatar-mini">{m.nome.charAt(0)}</div>
                  <div style={{flex: 1}}>
                    <strong>{m.nome}</strong>
                    <p style={{fontSize: '12px', color: '#64748b'}}>{m.cargo} • {m.turno}</p>
                  </div>
                  <button className="btn-delete" onClick={() => excluirMembro(m.id)}><Trash2 size={16} /></button>
                </div>
              ))}
              {equipe.length === 0 && <p>Nenhum funcionário cadastrado.</p>}
            </div>
          </>
        )}

        {/* ABA CONFIGURAÇÕES */}
        {aba === 'config' && (
          <div className="admin-config-container">
            <h2>Configurações de Acesso</h2>
            <div className="card-white">
              <form onSubmit={handleUpdateAdmin} className="admin-form">
                <label>Novo Nome de Usuário</label>
                <input required value={config.username} onChange={e => setConfig({...config, username: e.target.value})} placeholder="Ex: admin_sabor" />
                
                <label>Nova Senha</label>
                <input required type="password" value={config.password} onChange={e => setConfig({...config, password: e.target.value})} placeholder="••••••" />
                
                <label>Confirmar Nova Senha</label>
                <input required type="password" value={config.confirmPassword} onChange={e => setConfig({...config, confirmPassword: e.target.value})} placeholder="••••••" />
                
                <button type="submit" className="btn btn-primary" style={{marginTop: '20px'}}><Key size={18}/> Atualizar Credenciais</button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: NOVO PRODUTO */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content admin-modal">
              <div className="modal-header">
                <h3>Cadastrar Produto</h3>
                <button className="close-btn" onClick={() => setShowModal(false)}><X /></button>
              </div>
              <form onSubmit={handleSalvarProduto} className="admin-form">
                <label>Nome do Produto</label>
                <input required value={novoProd.name} onChange={e => setNovoProd({...novoProd, name: e.target.value})} />
                
                <div className="form-row">
                  <div>
                    <label>Preço (R$)</label>
                    <input required type="number" step="0.01" value={novoProd.price} onChange={e => setNovoProd({...novoProd, price: e.target.value})} />
                  </div>
                  <div>
                    <label>Prep. (min)</label>
                    <input required type="number" value={novoProd.prepTime} onChange={e => setNovoProd({...novoProd, prepTime: e.target.value})} />
                  </div>
                </div>

                <label>Categoria</label>
                <select value={novoProd.category} onChange={e => setNovoProd({...novoProd, category: e.target.value})}>
                  <option>Lanches</option><option>Bebidas</option><option>Sobremesas</option><option>Porções</option>
                </select>

                <label className="file-input-label">
                  <Upload size={18} />
                  {novoProd.image ? novoProd.image.name : "Selecionar Foto"}
                  <input type="file" hidden onChange={e => setNovoProd({...novoProd, image: e.target.files[0]})} />
                </label>
                <button type="submit" className="btn btn-primary btn-full">Salvar Produto</button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: NOVA EQUIPE */}
        {showModalEquipe && (
          <div className="modal-overlay">
            <div className="modal-content admin-modal">
              <div className="modal-header">
                <h3>Novo Membro</h3>
                <button className="close-btn" onClick={() => setShowModalEquipe(false)}><X /></button>
              </div>
              <form onSubmit={handleSalvarEquipe} className="admin-form">
                <label>Nome Completo</label>
                <input required value={novoMembro.nome} onChange={e => setNovoMembro({...novoMembro, nome: e.target.value})} />
                <label>Cargo</label>
                <input required value={novoMembro.cargo} onChange={e => setNovoMembro({...novoMembro, cargo: e.target.value})} placeholder="Ex: Cozinheiro" />
                <label>Turno</label>
                <select value={novoMembro.turno} onChange={e => setNovoMembro({...novoMembro, turno: e.target.value})}>
                  <option>Diurno</option><option>Noturno</option><option>Madrugada</option>
                </select>
                <button type="submit" className="btn btn-primary btn-full">Cadastrar na Equipe</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Admin;