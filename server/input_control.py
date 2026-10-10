"""
Remote Obscure — Módulo de Controle de Input
Controla mouse e teclado usando pyautogui.
"""

import logging
from typing import List

import pyautogui

logger = logging.getLogger("RemoteObscure.InputControl")

# Desabilita failsafe para permitir cliques nos cantos
pyautogui.FAILSAFE = False
# Remove delay entre ações para máxima responsividade
pyautogui.PAUSE = 0


class InputControl:
    """Controla mouse e teclado do PC."""

    def __init__(self):
        self.screen_width, self.screen_height = pyautogui.size()
        logger.info(f"Resolução da tela: {self.screen_width}x{self.screen_height}")

    def _to_screen_coords(self, x_norm: float, y_norm: float):
        """Converte coordenadas normalizadas (0-1) para pixels da tela."""
        x = int(x_norm * self.screen_width)
        y = int(y_norm * self.screen_height)
        # Garante que está dentro dos limites
        x = max(0, min(x, self.screen_width - 1))
        y = max(0, min(y, self.screen_height - 1))
        return x, y

    def move_mouse(self, x_norm: float, y_norm: float):
        """Move o mouse para a posição normalizada."""
        x, y = self._to_screen_coords(x_norm, y_norm)
        pyautogui.moveTo(x, y)

    def move_mouse_relative(self, dx: float, dy: float):
        """Move o mouse de forma relativa (Trackpad)."""
        try:
            pyautogui.move(int(dx), int(dy))
        except Exception as e:
            logger.error(f"Erro ao mover mouse: {e}")

    def click(self, x_norm: float = None, y_norm: float = None, button: str = "left"):
        """Clica na posição. Se x_norm e y_norm não informados, clica na posição atual."""
        if x_norm is not None and y_norm is not None:
            x, y = self._to_screen_coords(x_norm, y_norm)
            pyautogui.click(x, y, button=button)
            logger.debug(f"Click {button} em ({x}, {y})")
        else:
            pyautogui.click(button=button)
            logger.debug(f"Click {button} (atual)")

    def mouse_down(self, button: str = "left"):
        pyautogui.mouseDown(button=button)

    def mouse_up(self, button: str = "left"):
        pyautogui.mouseUp(button=button)

    def double_click(self, x_norm: float = None, y_norm: float = None):
        """Duplo clique na posição normalizada."""
        x, y = self._to_screen_coords(x_norm, y_norm)
        pyautogui.doubleClick(x, y)
        logger.debug(f"Double click em ({x}, {y})")

    def scroll(self, delta: int):
        """Scroll do mouse. Positivo = cima, negativo = baixo."""
        pyautogui.scroll(delta)
        logger.debug(f"Scroll: {delta}")

    def press_key(self, key: str):
        """Pressiona uma tecla."""
        try:
            pyautogui.press(key)
            logger.debug(f"Key press: {key}")
        except Exception as e:
            logger.error(f"Erro ao pressionar tecla '{key}': {e}")

    def key_combo(self, keys: List[str]):
        """Executa uma combinação de teclas (ex: ['ctrl', 'c'])."""
        try:
            pyautogui.hotkey(*keys)
            logger.debug(f"Key combo: {'+'.join(keys)}")
        except Exception as e:
            logger.error(f"Erro na combinação de teclas {keys}: {e}")

    def press_special(self, key: str):
        """Pressiona uma tecla especial (enter, tab, escape, etc.)."""
        # Mapa de teclas especiais
        special_map = {
            "enter": "enter",
            "tab": "tab",
            "escape": "escape",
            "esc": "escape",
            "backspace": "backspace",
            "delete": "delete",
            "space": "space",
            "up": "up",
            "down": "down",
            "left": "left",
            "right": "right",
            "home": "home",
            "end": "end",
            "pageup": "pageup",
            "pagedown": "pagedown",
            "insert": "insert",
            "f1": "f1", "f2": "f2", "f3": "f3", "f4": "f4",
            "f5": "f5", "f6": "f6", "f7": "f7", "f8": "f8",
            "f9": "f9", "f10": "f10", "f11": "f11", "f12": "f12",
            "printscreen": "printscreen",
            "capslock": "capslock",
            "numlock": "numlock",
            "win": "win",
            "windows": "win",
        }
        mapped = special_map.get(key.lower(), key)
        try:
            pyautogui.press(mapped)
            logger.debug(f"Special key: {mapped}")
        except Exception as e:
            logger.error(f"Erro na tecla especial '{key}': {e}")

    def type_text(self, text: str):
        """Digita um texto completo."""
        try:
            pyautogui.typewrite(text, interval=0.02)
            logger.debug(f"Type text: {text[:20]}...")
        except Exception as e:
            logger.error(f"Erro ao digitar texto: {e}")
