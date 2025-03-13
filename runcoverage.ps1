.venv\Scripts\Activate.ps1
coverage run -m pytest src/tests/ws_test.py src/tests/cards_test.py src/tests/endpoints_tests.py
coverage report -m