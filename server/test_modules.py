"""Teste rapido dos modulos do servidor."""
import sys
import os
os.environ['PYTHONIOENCODING'] = 'utf-8'
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, '.')

from config import Config
from screen_capture import ScreenCapture
from input_control import InputControl
from system_commands import SystemCommands
from program_manager import ProgramManager

print("[OK] Todos os modulos importados com sucesso!")

sc = ScreenCapture(Config())
w, h = sc.get_screen_size()
print(f"[TELA] Resolucao: {w}x{h}")

frame = sc.capture_frame()
print(f"[FRAME] Capturado: {len(frame)} bytes")
sc.close()

progs = ProgramManager.get_running_programs()
print(f"[PROGS] Programas rodando: {len(progs)}")
for p in progs[:5]:
    title = p['title'][:50]
    print(f"  - {p['name']}: {title}")

print("\n[SUCESSO] Servidor pronto para uso!")
