from passlib.context import CryptContext

# Configuração do algoritmo de hash
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_senha(senha: str):
    """Transforma a senha em um hash seguro"""
    return pwd_context.hash(senha)

def verificar_senha(senha_plana, senha_hash):
    """Compara a senha digitada com o hash do banco"""
    return pwd_context.verify(senha_plana, senha_hash)