from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import models, database, auth
from pydantic import BaseModel
import json
import shutil
import os
from database import engine

# Cria as tabelas no MySQL se não existirem
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configuração de CORS para permitir acesso do React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuração de Uploads
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# --- SCHEMAS (Pydantic) ---
class LoginSchema(BaseModel):
    usuario: str
    senha: str

class MembroEquipeSchema(BaseModel):
    nome: str
    cargo: str
    turno: str

class UpdateAdminSchema(BaseModel):
    username: str
    password: str

# --- ROTAS DE PRODUTOS ---

@app.get("/menu")
def get_menu(db: Session = Depends(database.get_db)):
    return db.query(models.Produto).all()

@app.post("/produtos")
async def criar_produto(
    name: str = Form(...),
    price: float = Form(...),
    category: str = Form(...),
    prepTime: int = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(database.get_db)
):
    file_path = os.path.join(UPLOAD_DIR, image.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
    
    # URL que o frontend vai salvar para exibir a imagem
    image_url = f"/uploads/{image.filename}"
    
    novo = models.Produto(
        name=name, 
        price=price, 
        category=category, 
        prepTime=prepTime, 
        image=image_url
    )
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo

@app.delete("/produtos/{id}")
def deletar_produto(id: int, db: Session = Depends(database.get_db)):
    prod = db.query(models.Produto).filter(models.Produto.id == id).first()
    if prod:
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

@app.delete("/admin/pedidos/{id}")
def finalizar_pedido(id: int, db: Session = Depends(database.get_db)):
    pedido = db.query(models.Pedido).filter(models.Pedido.id == id).first()
    if pedido:
        db.delete(pedido)
        db.commit()
    return {"status": "pedido finalizado"}

# --- ROTAS DE EQUIPE (CRUD) ---

@app.get("/admin/equipe")
def listar_equipe(db: Session = Depends(database.get_db)):
    return db.query(models.MembroEquipe).all()

@app.post("/admin/equipe")
def adicionar_membro(membro: MembroEquipeSchema, db: Session = Depends(database.get_db)):
    novo = models.MembroEquipe(**membro.dict())
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo

@app.delete("/admin/equipe/{id}")
def remover_membro(id: int, db: Session = Depends(database.get_db)):
    membro = db.query(models.MembroEquipe).filter(models.MembroEquipe.id == id).first()
    if membro:
        db.delete(membro)
        db.commit()
    return {"ok": True}

# --- ROTAS DE CONFIGURAÇÃO E LOGIN ---

@app.post("/login")
def login(dados: LoginSchema, db: Session = Depends(database.get_db)):
    user = db.query(models.Usuario).filter(models.Usuario.username == dados.usuario).first()
    if not user or not auth.verificar_senha(dados.senha, user.password):
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos")
    return {"status": "sucesso", "token": "token_fake"}

@app.put("/admin/update-access")
def atualizar_acesso(dados: UpdateAdminSchema, db: Session = Depends(database.get_db)):
    user = db.query(models.Usuario).first() # Pega o primeiro admin cadastrado
    if not user:
        raise HTTPException(status_code=404, detail="Usuário admin não encontrado")
    
    user.username = dados.username
    user.password = auth.hash_senha(dados.password) # Encripta a nova senha
    db.commit()
    return {"status": "sucesso"}