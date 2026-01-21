import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  ShoppingBag, 
  UtensilsCrossed, 
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
  const [statusPedido, setStatusPedido] = useState(null); // 'enviando', 'sucesso'
  const [nomeCliente, setNomeCliente] = useState('');

  // Carregar produtos do Backend
  useEffect(() => {
    const carregarMenu = async () => {
      try {
        const response = await api.get('/menu');
        setProdutos(response.data);
      } catch (err) {
        console.error("Erro ao carregar menu:", err);
      }
    };
    carregarMenu();
  }, []);

  // Lógica do Carrinho
  const adicionarAoCarrinho = (produto) => {
    setCarrinho(prev => {
      const itemExiste = prev.find(item => item.id === produto.id);
      if (itemExiste) {
        return prev.map(item => 
          item.id === produto.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...produto, quantity: 1 }];
    });
  };

  const removerDoCarrinho = (id) => {
    setCarrinho(prev => prev.filter(item => item.id !== id));
  };

  const totalCarrinho = carrinho.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Enviar Pedido para o Backend
  const finalizarPedido = async () => {
    if (!nomeCliente) return alert("Por favor, digite seu nome.");
    if (carrinho.length === 0) return alert("Seu carrinho está vazio.");

    setStatusPedido('enviando');
    try {
      await api.post('/pedidos', {
        customerName: nomeCliente,
        items: carrinho,
        total: totalCarrinho,
        paymentMethod: 'Cartão/Pix'
      });
      setStatusPedido('sucesso');
      setCarrinho([]);
      setNomeCliente('');
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Erro ao enviar pedido.");
      setStatusPedido(null);
    }
  };

  const categorias = ['Todos', ...new Set(produtos.map(p => p.category))];
  const produtosFiltrados = categoriaAtiva === 'Todos' 
    ? produtos 
    : produtos.filter(p => p.category === categoriaAtiva);

  return (
    <div className="menu-container">
      {/* Botão discreto de Admin */}
      <Link to="/login" className="admin-access-lock" title="Área do Gerente">
        <Lock size={16} />
      </Link>

      <header className="menu-header">
        <div className="logo-area">
          <UtensilsCrossed size={40} color="#27ae60" />
          <h1>Sabor & Cia</h1>
          <p>O melhor sabor no conforto da sua casa</p>
        </div>
      </header>

      <nav className="category-nav">
        {categorias.map(cat => (
          <button 
            key={cat} 
            className={categoriaAtiva === cat ? 'active' : ''}
            onClick={() => setCategoriaAtiva(cat)}
          >
            {cat}
          </button>
        ))}
      </nav>

      <main className="menu-main">
        <section className="products-grid">
          {produtosFiltrados.map(prod => (
            <div key={prod.id} className="product-card">
              <div className="product-emoji">{prod.image}</div>
              <div className="product-info">
                <h3>{prod.name}</h3>
                <div className="product-meta">
                  <span className="prep-time"><Clock size={14}/> {prod.prepTime} min</span>
                  <span className="price">R$ {prod.price.toFixed(2)}</span>
                </div>
                <button onClick={() => adicionarAoCarrinho(prod)} className="add-button">
                  <Plus size={18} /> Adicionar
                </button>
              </div>
            </div>
          ))}
        </section>

        <aside className="cart-sidebar">
          <div className="cart-header">
            <ShoppingBag />
            <h2>Seu Carrinho</h2>
          </div>

          <div className="cart-items">
            {carrinho.length === 0 ? (
              <p className="empty-cart">Seu carrinho está vazio</p>
            ) : (
              carrinho.map(item => (
                <div key={item.id} className="cart-item">
                  <span>{item.quantity}x {item.name}</span>
                  <div className="item-actions">
                    <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                    <button onClick={() => removerDoCarrinho(item.id)}><Minus size={14}/></button>
                  </div>
                </div>
              ))
            )}
          </div>

          {carrinho.length > 0 && (
            <div className="cart-footer">
              <div className="total-row">
                <span>Total:</span>
                <strong>R$ {totalCarrinho.toFixed(2)}</strong>
              </div>
              <input 
                type="text" 
                placeholder="Seu nome" 
                value={nomeCliente}
                onChange={(e) => setNomeCliente(e.target.value)}
                className="customer-input"
              />
              <button 
                className="checkout-btn" 
                onClick={finalizarPedido}
                disabled={statusPedido === 'enviando'}
              >
                {statusPedido === 'enviando' ? 'Enviando...' : 'Confirmar Pedido'}
              </button>
            </div>
          )}

          {statusPedido === 'sucesso' && (
            <div className="success-overlay">
              <CheckCircle2 size={48} color="#27ae60" />
              <h3>Pedido Confirmado!</h3>
              <p>Já estamos preparando seu lanche.</p>
              <button onClick={() => setStatusPedido(null)}>Fechar</button>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
};

export default Menu;