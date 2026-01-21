from sqlalchemy import Column, Integer, String, Float, Text
from database import Base

class Produto(Base):
    __tablename__ = "produtos"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    price = Column(Float)
    category = Column(String(50))
    image = Column(String(255))
    prepTime = Column(Integer)

class Pedido(Base):
    __tablename__ = "pedidos"
    id = Column(Integer, primary_key=True, index=True)
    customerName = Column(String(100))
    items = Column(Text)
    total = Column(Float)
    paymentMethod = Column(String(50))

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True)
    password = Column(String(255)) # Aumentado para suportar hashes de senha

class MembroEquipe(Base):
    __tablename__ = "equipe"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100))
    cargo = Column(String(100))
    turno = Column(String(50))