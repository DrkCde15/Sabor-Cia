from database import SessionLocal, engine
import models, auth

models.Base.metadata.create_all(bind=engine)

def create_admin():
    db = SessionLocal()
    if not db.query(models.Usuario).filter(models.Usuario.username == "admin").first():
        senha_segura = auth.gerar_hash("SaborCia@2026")
        admin = models.Usuario(username="admin", password=senha_segura)
        db.add(admin)
        db.commit()
        print("✅ Admin criado com senha criptografada!")
    db.close()

if __name__ == "__main__":
    create_admin()