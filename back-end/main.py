from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, database, auth
from pydantic import BaseModel
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Schemas Pydantic
class ProdutoSchema(BaseModel):
    name: str
    price: float
    category: str
    image: str
    prepTime: int

class LoginSchema(BaseModel):
    usuario: str
    senha: str

# --- ROTAS DE PRODUTOS ---
@app.get("/menu")
def get_menu(db: Session = Depends(database.get_db)):
    return db.query(models.Produto).all()

@app.post("/produtos")
def criar_produto(item: ProdutoSchema, db: Session = Depends(database.get_db)):
    novo = models.Produto(**item.dict())
    db.add(novo)
    db.commit()
    return novo

@app.delete("/produtos/{id}")
def deletar_produto(id: int, db: Session = Depends(database.get_db)):
    prod = db.query(models.Produto).filter(models.Produto.id == id).first()
    db.delete(prod)
    db.commit()
    return {"ok": True}

# --- ROTAS DE PEDIDOS ---
@app.post("/pedidos")
def novo_pedido(dados: dict, db: Session = Depends(database.get_db)):
    pedido = models.Pedido(
        customerName=dados['customerName'],
        total=dados['total'],
        paymentMethod=dados['paymentMethod'],
        items=json.dumps(dados['items'])
    )
    db.add(pedido)
    db.commit()
    return {"id": pedido.id}

@app.get("/admin/pedidos")
def listar_pedidos(db: Session = Depends(database.get_db)):
    return db.query(models.Pedido).order_by(models.Pedido.id.desc()).all()

# --- ROTAS DE USUÁRIOS E SEGURANÇA ---
@app.post("/login")
def login(dados: LoginSchema, db: Session = Depends(database.get_db)):
    user = db.query(models.Usuario).filter(models.Usuario.username == dados.usuario).first()
    if not user or not auth.verificar_senha(dados.senha, user.password):
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos")
    return {"status": "sucesso", "token": "token_gerado_fake"}

@app.post("/admin/usuarios")
def cadastrar_equipe(dados: LoginSchema, db: Session = Depends(database.get_db)):
    hash_senha = auth.gerar_hash(dados.senha)
    novo = models.Usuario(username=dados.usuario, password=hash_senha)
    db.add(novo)
    db.commit()
    return {"status": "criado"}

@app.get("/admin/usuarios")
def listar_equipe(db: Session = Depends(database.get_db)):
    return db.query(models.Usuario).all()

# --- ROTA PARA FINALIZAR/DELETAR PEDIDO ---
@app.delete("/admin/pedidos/{id}")
def finalizar_pedido(id: int, db: Session = Depends(database.get_db)):
    pedido = db.query(models.Pedido).filter(models.Pedido.id == id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    db.delete(pedido)
    db.commit()
    return {"status": "pedido finalizado"}

@app.put("/admin/perfil")
def atualizar_perfil(dados: LoginSchema, db: Session = Depends(database.get_db)):
    # Localiza o admin original (ajuste o critério se necessário)
    user = db.query(models.Usuario).first() 
    user.username = dados.usuario
    user.password = auth.gerar_hash(dados.senha)
    db.commit()
    return {"status": "atualizado"}