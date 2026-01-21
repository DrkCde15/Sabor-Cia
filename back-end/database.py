from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv # Adicione esta linha

# Isso carrega as variáveis do arquivo .env para o sistema
load_dotenv() 

URL_BANCO = os.getenv("URL_BANCO")

# Verificação de segurança para ajudar no debug
if URL_BANCO is None:
    raise ValueError("Erro: A variável URL_BANCO não foi encontrada no arquivo .env")

engine = create_engine(URL_BANCO)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()