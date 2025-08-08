from fastapi import FastAPI
from routes.user_routes import router as user_router

app = FastAPI()

# Incluir rutas
app.include_router(user_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "FisioMove API funcionando correctamente"}
