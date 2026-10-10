"""
Remote Obscure — Módulo de Captura de Tela
Usa mss para capturar a tela e Pillow para redimensionar/comprimir.
"""

import io
import logging
from typing import Optional, Tuple

import mss
from PIL import Image, ImageDraw
import pyautogui

from config import Config

logger = logging.getLogger("RemoteObscure.ScreenCapture")

class ScreenCapture:
    """Captura frames da tela do PC."""

    def __init__(self, config: Config):
        self.config = config
        self._sct: Optional[mss.mss] = None

    def _get_sct(self) -> mss.mss:
        """Retorna a instância do mss (cria se necessário)."""
        if self._sct is None:
            self._sct = mss.mss()
        return self._sct

    def get_screen_size(self) -> Tuple[int, int]:
        """Retorna a resolução real da tela (width, height)."""
        sct = self._get_sct()
        monitor = sct.monitors[self.config.CAPTURE_MONITOR]
        return monitor["width"], monitor["height"]

    def capture_frame(self) -> bytes:
        """
        Captura um frame da tela, desenha o cursor do mouse, redimensiona e comprime em JPEG.
        Retorna os bytes JPEG do frame.
        """
        sct = self._get_sct()
        monitor = sct.monitors[self.config.CAPTURE_MONITOR]

        # Captura a tela
        screenshot = sct.grab(monitor)

        # Converte para Pillow Image
        img = Image.frombytes("RGB", screenshot.size, screenshot.bgra, "raw", "BGRX")

        # Desenha o cursor do mouse (simples seta vermelha)
        try:
            mx, my = pyautogui.position()
            # Ajusta para a coordenada do monitor
            rel_x = mx - monitor["left"]
            rel_y = my - monitor["top"]
            draw = ImageDraw.Draw(img)
            # Triângulo simples
            draw.polygon([(rel_x, rel_y), (rel_x+12, rel_y+12), (rel_x+5, rel_y+15), (rel_x, rel_y+20)], fill="red", outline="white")
        except Exception:
            pass

        # Redimensiona se necessário
        if self.config.CAPTURE_SCALE < 1.0:
            new_width = int(img.width * self.config.CAPTURE_SCALE)
            new_height = int(img.height * self.config.CAPTURE_SCALE)
            img = img.resize((new_width, new_height), Image.LANCZOS)

        # Comprime para JPEG
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=self.config.CAPTURE_QUALITY)
        return buffer.getvalue()

    def close(self):
        """Fecha o recurso de captura."""
        if self._sct is not None:
            self._sct.close()
            self._sct = None
