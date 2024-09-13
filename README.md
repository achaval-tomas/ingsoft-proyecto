# Guía de instalación y uso
Ejecutar los siguientes comandos en orden.
### Crear entorno virtual
`python -m venv .venv`
### Activar entorno virtual
 - En Linux `source .venv/bin/activate`
 - En Windows `.venv\Scripts\Activate.ps1`
### Instalar FastAPI
`pip install "fastapi[standard]"`
### Iniciar el servidor
`fastapi dev main.py`