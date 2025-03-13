cd frontend
Start-Process powershell.exe -ArgumentList "-Command .\run.ps1"
cd ../backend
Start-Process powershell.exe -ArgumentList "-Command .\cleanrun.ps1"
cd ..