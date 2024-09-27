# Guía de instalación y uso
Ejecutar los siguientes comandos en orden.
### Crear entorno virtual
`python -m venv .venv`
### Activar entorno virtual
 - En Linux `source .venv/bin/activate`
 - En Windows `.venv\Scripts\Activate.ps1`
### Instalar FastAPI y sqlalchemy
`pip install "fastapi[standard]"`
`pip install sqlalchemy`
### Iniciar el servidor
`uvicorn src.main:app --reload`