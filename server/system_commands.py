"""
Remote Obscure — Módulo de Comandos do Sistema
Executa ações como desligar, reiniciar, sleep, etc.
"""

import ctypes
import logging
import os
from typing import Tuple

import pyautogui

logger = logging.getLogger("RemoteObscure.SystemCommands")

class SystemCommands:
    """Executa comandos do sistema operacional."""

    @staticmethod
    def shutdown() -> Tuple[bool, str]:
        """Desliga o PC em 5 segundos."""
        try:
            os.system("shutdown /s /t 5")
            logger.warning("Comando de DESLIGAR executado!")
            return True, "PC será desligado em 5 segundos"
        except Exception as e:
            logger.error(f"Erro ao desligar: {e}")
            return False, str(e)

    @staticmethod
    def volume_up() -> Tuple[bool, str]:
        pyautogui.press("volumeup")
        return True, "Volume +"

    @staticmethod
    def volume_down() -> Tuple[bool, str]:
        pyautogui.press("volumedown")
        return True, "Volume -"

    @staticmethod
    def volume_mute() -> Tuple[bool, str]:
        pyautogui.press("volumemute")
        return True, "Mudo"

    @staticmethod
    def media_play_pause() -> Tuple[bool, str]:
        pyautogui.press("playpause")
        return True, "Play/Pause"

    @staticmethod
    def media_next() -> Tuple[bool, str]:
        pyautogui.press("nexttrack")
        return True, "Próxima"

    @staticmethod
    def media_prev() -> Tuple[bool, str]:
        pyautogui.press("prevtrack")
        return True, "Anterior"

    @staticmethod
    def restart() -> Tuple[bool, str]:
        """Reinicia o PC em 5 segundos."""
        try:
            os.system("shutdown /r /t 5")
            logger.warning("Comando de REINICIAR executado!")
            return True, "PC será reiniciado em 5 segundos"
        except Exception as e:
            logger.error(f"Erro ao reiniciar: {e}")
            return False, str(e)

    @staticmethod
    def sleep() -> Tuple[bool, str]:
        """Coloca o PC em modo suspensão."""
        try:
            ctypes.windll.PowrProf.SetSuspendState(0, 1, 0)
            logger.warning("Comando de SUSPENSÃO executado!")
            return True, "PC entrando em modo suspensão"
        except Exception as e:
            logger.error(f"Erro ao suspender: {e}")
            return False, str(e)

    @staticmethod
    def hibernate() -> Tuple[bool, str]:
        """Coloca o PC em modo hibernação."""
        try:
            os.system("shutdown /h")
            logger.warning("Comando de HIBERNAÇÃO executado!")
            return True, "PC entrando em hibernação"
        except Exception as e:
            logger.error(f"Erro ao hibernar: {e}")
            return False, str(e)

    @staticmethod
    def lock() -> Tuple[bool, str]:
        """Bloqueia a tela do PC."""
        try:
            ctypes.windll.user32.LockWorkStation()
            logger.info("Tela bloqueada!")
            return True, "Tela bloqueada"
        except Exception as e:
            logger.error(f"Erro ao bloquear: {e}")
            return False, str(e)

    @staticmethod
    def cancel_shutdown() -> Tuple[bool, str]:
        """Cancela um desligamento/reinício agendado."""
        try:
            os.system("shutdown /a")
            logger.info("Desligamento cancelado!")
            return True, "Desligamento cancelado"
        except Exception as e:
            logger.error(f"Erro ao cancelar: {e}")
            return False, str(e)

    def execute(self, action: str) -> Tuple[bool, str]:
        """Executa uma ação do sistema pelo nome."""
        actions = {
            "shutdown": self.shutdown,
            "restart": self.restart,
            "sleep": self.sleep,
            "hibernate": self.hibernate,
            "lock": self.lock,
            "cancel_shutdown": self.cancel_shutdown,
            "volume_up": self.volume_up,
            "volume_down": self.volume_down,
            "volume_mute": self.volume_mute,
            "media_play_pause": self.media_play_pause,
            "media_next": self.media_next,
            "media_prev": self.media_prev,
        }

        handler = actions.get(action)
        if handler is None:
            return False, f"Ação desconhecida: {action}"

        return handler()
