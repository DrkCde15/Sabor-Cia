import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Lock,
  Clock,
  CheckCircle2
} from 'lucide-react';
import '../App.css';

const Menu = () => {
  const [produtos, setProdutos] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [carrinho, setCarrinho] = useState([]);
  const [statusPedido, setStatusPedido] = useState(null);
  const [nomeCliente, setNomeCliente] = useState('');
  const [busca, setBusca] = useState('');

  // Carrega os produtos do banco de dados
  useEffect(() => {
    api.get('/menu')
      .then(res => setProdutos(res.data))
      .catch(err => console.error("Erro ao carregar menu:", err));
  }, []);

  const adicionarAoCarrinho = (produto) => {
    setCarrinho(prev => {
      const existe = prev.find(p => p.id === produto.id);
      if (existe) {
        return prev.map(p =>
          p.id === produto.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...produto, quantity: 1 }];
    });
  };

  const removerDoCarrinho = (id) => {
    setCarrinho(prev =>
      prev
        .map(p => p.id === id ? { ...p, quantity: p.quantity - 1 } : p)
        .filter(p => p.quantity > 0)
    );
  };

  const total = carrinho.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const finalizarPedido = async () => {
    if (!nomeCliente || carrinho.length === 0) {
      alert("Por favor, informe seu nome e adicione itens ao carrinho.");
      return;
    }

    setStatusPedido('enviando');

    try {
      await api.post('/pedidos', {
        customerName: nomeCliente,
        // Converte os itens em uma string legível para o Admin
        items: carrinho.map(i => `${i.quantity}x ${i.name}`).join(', '),
        total: total,
        paymentMethod: "Pagar na Entrega" // Campo obrigatório no seu modelo Backend
      });

      setCarrinho([]);
      setNomeCliente('');
      setStatusPedido('sucesso');
    } catch (error) {
      console.error("Erro ao enviar pedido:", error);
      alert("Houve um erro ao processar seu pedido.");
      setStatusPedido(null);
    }
  };

  const categorias = ['Todos', ...new Set(produtos.map(p => p.category))];

  const produtosFiltrados = produtos.filter(p =>
    (categoriaAtiva === 'Todos' || p.category === categoriaAtiva) &&
    p.name.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="menu-page-container">

      {/* HEADER DINÂMICO */}
      <header className="ml-header-yellow">
        <div className="ml-header-content">
          <span className="logo-text">SABOR<span>&CIA</span></span>

          <div className="ml-search-container">
            <input
              placeholder="O que você quer comer hoje?"
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
            <button className="ml-search-btn"><Search size={18} /></button>
          </div>

          <Link to="/login" className="btn-ghost btn-ghost-icon" title="Acesso Administrativo">
            <Lock size={18} />
          </Link>

        </div>
      </header>

      {/* NAVEGAÇÃO DE CATEGORIAS */}
      <nav className="category-pills-container">
        <div className="pills-wrapper">
          {categorias.map(cat => (
            <button
              key={cat}
              className={categoriaAtiva === cat ? 'active' : ''}
              onClick={() => setCategoriaAtiva(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="menu-content-wrapper">

        {/* GRADE DE PRODUTOS */}
        <section className="products-display-grid">
          {produtosFiltrados.map(prod => (
            <div key={prod.id} className="customer-product-card">
              <div className="product-image-wrapper">
                <img
                  // ADICIONE A URL DO SEU BACKEND AQUI:
                  src={prod.image ? `http://localhost:8000${prod.image}` : 'https://via.placeholder.com/300x200?text=Sem+Imagem'}
                  alt={prod.name}
                  className="product-img-main"
                  // DICA: Adicione um fallback caso a imagem falhe ao carregar
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Erro+ao+Carregar'; }}
                />
              </div>

              <div className="product-details">
                <h3>{prod.name}</h3>
                <div className="product-price-container">
                  <span className="price-value">R$ {prod.price.toFixed(2)}</span>
                </div>

                <p className="product-shipping">
                  <Clock size={14} /> {prod.prepTime} - {prod.prepTime + 10} min
                </p>

                <button
                  className="btn btn-primary btn-full"
                  style={{ marginTop: '15px' }}
                  onClick={() => adicionarAoCarrinho(prod)}
                >
                  <Plus size={16} /> Adicionar
                </button>
              </div>
            </div>
          ))}
          {produtosFiltrados.length === 0 && (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
              Nenhum produto encontrado.
            </p>
          )}
        </section>

        {/* BARRA LATERAL: CARRINHO */}
        <aside className="shopping-cart-sidebar">
          <h2 className="cart-title"><ShoppingBag size={20} /> Seu Pedido</h2>

          <div className="cart-items-list">
            {carrinho.map(item => (
              <div key={item.id} className="cart-item-ml">
                <div className="cart-item-info">
                  <strong>{item.name}</strong>
                  <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <div className="cart-item-controls">
                  <button onClick={() => removerDoCarrinho(item.id)}><Minus size={12} /></button>
                  <span>{item.quantity}</span>
                  <button onClick={() => adicionarAoCarrinho(item)}><Plus size={12} /></button>
                </div>
              </div>
            ))}

            {carrinho.length === 0 && (
              <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '20px' }}>
                Carrinho vazio
              </p>
            )}
          </div>

          {carrinho.length > 0 && (
            <div className="cart-summary-ml">
              <div className="summary-row">
                <span>Subtotal</span>
                <strong className="summary-total">R$ {total.toFixed(2)}</strong>
              </div>

              <input
                className="ml-input-text"
                style={{ margin: '15px 0' }}
                placeholder="Qual seu nome?"
                value={nomeCliente}
                onChange={e => setNomeCliente(e.target.value)}
              />

              <button
                className="btn btn-primary btn-full"
                onClick={finalizarPedido}
                disabled={statusPedido === 'enviando'}
              >
                {statusPedido === 'enviando' ? 'Enviando...' : 'Finalizar Pedido'}
              </button>
            </div>
          )}
        </aside>
      </main>

      {/* MODAL DE SUCESSO */}
      {statusPedido === 'sucesso' && (
        <div className="modal-overlay">
          <div className="modal-content success-modal" style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--brand-green)', marginBottom: '20px' }}>
              <CheckCircle2 size={80} />
            </div>
            <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>Pedido Recebido!</h2>
            <p style={{ color: 'var(--text-light)', marginBottom: '30px' }}>
              Seu pedido já está sendo preparado.
            </p>
            <button className="btn btn-primary btn-full" onClick={() => setStatusPedido(null)}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;