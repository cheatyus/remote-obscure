"""
Remote Obscure — Módulo de Gerenciamento de Programas
Lista, abre e fecha programas usando psutil e ctypes.
"""

import ctypes
import ctypes.wintypes
import logging
import subprocess
from typing import Dict, List, Tuple

import psutil

logger = logging.getLogger("RemoteObscure.ProgramManager")

# Tipos e funções do Windows API
user32 = ctypes.windll.user32
WNDENUMPROC = ctypes.WINFUNCTYPE(
    ctypes.wintypes.BOOL,
    ctypes.wintypes.HWND,
    ctypes.wintypes.LPARAM,
)


class ProgramManager:
    """Gerencia programas em execução no PC."""

    @staticmethod
    def get_running_programs() -> List[Dict]:
        """
        Lista programas com janelas visíveis.
        Retorna lista de dicts com pid, name e title.
        """
        programs = []
        seen_pids = set()

        def enum_callback(hwnd, _lparam):
            # Verifica se a janela é visível
            if not user32.IsWindowVisible(hwnd):
                return True

            # Obtém o título da janela
            length = user32.GetWindowTextLengthW(hwnd)
            if length == 0:
                return True

            title_buffer = ctypes.create_unicode_buffer(length + 1)
            user32.GetWindowTextW(hwnd, title_buffer, length + 1)
            title = title_buffer.value

            if not title.strip():
                return True

            # Obtém o PID do processo
            pid = ctypes.wintypes.DWORD()
            user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
            pid_val = pid.value

            # Evita duplicatas do mesmo processo
            if pid_val in seen_pids:
                return True
            seen_pids.add(pid_val)

            # Obtém o nome do processo
            try:
                proc = psutil.Process(pid_val)
                name = proc.name()
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                name = "Desconhecido"

            programs.append({
                "pid": pid_val,
                "name": name,
                "title": title,
            })
            return True

        # Enumera todas as janelas
        try:
            callback = WNDENUMPROC(enum_callback)
            user32.EnumWindows(callback, 0)
        except Exception as e:
            logger.error(f"Erro ao enumerar janelas: {e}")

        # Ordena por nome
        programs.sort(key=lambda p: p["name"].lower())
        logger.info(f"Encontrados {len(programs)} programas")
        return programs

    @staticmethod
    def close_program(pid: int) -> Tuple[bool, str]:
        """Fecha um programa pelo PID."""
        try:
            proc = psutil.Process(pid)
            name = proc.name()
            proc.terminate()
            # Espera até 3 segundos para fechar
            try:
                proc.wait(timeout=3)
            except psutil.TimeoutExpired:
                proc.kill()  # Força se não fechou
            logger.info(f"Programa fechado: {name} (PID: {pid})")
            return True, f"Programa '{name}' fechado"
        except psutil.NoSuchProcess:
            return False, f"Processo {pid} não encontrado"
        except psutil.AccessDenied:
            return False, f"Sem permissão para fechar processo {pid}"
        except Exception as e:
            logger.error(f"Erro ao fechar programa {pid}: {e}")
            return False, str(e)

    @staticmethod
    def open_program(path: str) -> Tuple[bool, str]:
        """Abre um programa pelo caminho ou nome."""
        try:
            # Usa subprocess para abrir desvinculado
            subprocess.Popen(
                path,
                shell=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=subprocess.DETACHED_PROCESS,
            )
            logger.info(f"Programa aberto: {path}")
            return True, f"Programa '{path}' aberto"
        except Exception as e:
            logger.error(f"Erro ao abrir programa '{path}': {e}")
            return False, str(e)
