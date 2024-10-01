# Guía de instalación y uso
Ejecutar los siguientes comandos en orden.
### 1. Crear entorno virtual
`python -m venv .venv`
### 2. Activar entorno virtual
 - En Linux `source .venv/bin/activate`
 - En Windows (powershell) `.venv\Scripts\Activate.ps1`
### 3. Instalar dependencias necesarias
`pip install -r requirements.txt`
### 4. Iniciar el servidor
`fastapi dev src/main.py`

### Extra: Correr tests
Para correr tests, es necesario instalar pytest (`pip install pytest`) y luego ejecutar `pytest src/tests/nombre_del_test.py`

### Salir del entorno virtual
Para salir de un entorno virtual activo, es suficiente con ejecutar `deactivate`