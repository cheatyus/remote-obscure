"""
Remote Obscure — Configurações do Servidor
"""


class Config:
    """Configurações do servidor Remote Obscure."""

    # Rede
    HOST = "0.0.0.0"
    PORT = 8765

    # Autenticação
    PASSWORD = "remote123"

    # Captura de tela
    CAPTURE_QUALITY = 50        # Qualidade JPEG (1-100)
    CAPTURE_FPS = 15            # Frames por segundo
    CAPTURE_SCALE = 0.5         # Fator de escala (0.1 - 1.0)
    CAPTURE_MONITOR = 1         # Monitor primário

    # Servidor
    MAX_CLIENTS = 1             # Apenas um cliente por vez
