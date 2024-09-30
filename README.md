# Guía de instalación y uso
Ejecutar los siguientes comandos en orden.
### Crear entorno virtual
`python -m venv .venv`
### Activar entorno virtual
 - En Linux `source .venv/bin/activate`
 - En Windows `.venv\Scripts\Activate.ps1`
### Instalar dependencias necesarias
`pip install -r requirements.txt`
### Iniciar el servidor
`fastapi dev src/main.py`