# 🍽️ Sabor & Cia - Sistema Fullstack de Pedidos Online

Um sistema completo para restaurantes, unindo uma interface de cliente moderna com um painel administrativo robusto para gestão em tempo real.

---

## ✨ Novas Funcionalidades (v2.0)

### 👨‍"💼 **Painel Administrativo Completo**

* **Gestão de Pedidos:** Fila de produção em tempo real com opção de finalizar pedidos.
* **Controle de Cardápio:** Interface para adicionar, editar e excluir produtos (preço, nome, categoria e emojis).
* **Gestão de Equipe:** Cadastro de novos usuários administrativos e alteração de perfil/senha.
* **Sidebar Dinâmica:** Navegação fixa e intuitiva para controle total do estabelecimento.

### 🍱 **Experiência do Cliente Aprimorada**

* **Carrinho Lateral:** O cliente acompanha o total do pedido enquanto navega pelos lanches.
* **Categorização Automática:** Filtros dinâmicos baseados nos produtos cadastrados no banco.

---

## 🛠️ Tecnologias Utilizadas

**Frontend:**

* **React.js** (Hooks, Router)
* **Lucide React** (Ícones modernos)
* **Axios** (Comunicação com API)

**Backend:**

* **Python / FastAPI** (Alta performance)
* **SQLAlchemy** (ORM para banco de dados)
* **MySQL** (Armazenamento de dados)

---

## 🚀 Como Executar o Projeto

### 1. Backend (Python)

```bash
# Entre na pasta do servidor
cd backend

# Instale as dependências
pip install fastapi uvicorn sqlalchemy

# Inicie o servidor
uvicorn main:app --reload

```

### 2. Frontend (React)

```bash
# Entre na pasta do frontend
cd frontend

# Instale as dependências
npm install

# Inicie a aplicação
npm run dev

```

---

## 📁 Estrutura do Projeto

```text
├── backend/
│   ├── main.py         # Rotas e Lógica da API
│   ├── models.py       # Definição das tabelas do Banco
│   └── database.py     # Conexão com SQLite
├── src/
│   ├── pages/
│   │   ├── Menu.jsx    # Área do Cliente
│   │   ├── Admin.jsx   # Gestão do Restaurante
│   │   └── Login.jsx   # Acesso Administrativo
│   ├── services/
│   │   └── api.js      # Configuração do Axios
│   └── App.css         # Estilização Global Unificada

```

---

## 🔒 Segurança e Acesso

Para acessar o painel administrativo:

1. Clique no ícone de cadeado discreto no canto inferior do menu.
2. Utilize as credenciais de administrador cadastradas no banco de dados.