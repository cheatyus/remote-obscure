"""
Remote Obscure — Servidor Principal
Servidor WebSocket para controle remoto do PC.
"""

import asyncio
import json
import logging
import socket
import time
import sys

# Corrige erro de codificação no CMD do Windows
if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

from typing import Optional

import websockets
from websockets.server import ServerConnection

from config import Config
from screen_capture import ScreenCapture
from input_control import InputControl
from system_commands import SystemCommands
from program_manager import ProgramManager

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)-30s | %(levelname)-7s | %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("RemoteObscure")

# Instâncias globais
config = Config()
screen_capture = ScreenCapture(config)
input_control = InputControl()
system_commands = SystemCommands()
program_manager = ProgramManager()

# Cliente ativo (apenas um por vez)
active_client: Optional[ServerConnection] = None


def get_local_ips() -> list[str]:
    """Retorna os IPs locais da máquina."""
    ips = []
    try:
        hostname = socket.gethostname()
        addresses = socket.getaddrinfo(hostname, None, socket.AF_INET)
        for addr in addresses:
            ip = addr[4][0]
            if ip not in ips and ip != "127.0.0.1":
                ips.append(ip)
    except Exception:
        pass
    if not ips:
        # Fallback: conecta a um socket UDP para descobrir o IP
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ips.append(s.getsockname()[0])
            s.close()
        except Exception:
            ips.append("127.0.0.1")
    return ips


def print_banner():
    """Exibe o banner do servidor."""
    ips = get_local_ips()

    print()
    print("╔══════════════════════════════════════════════╗")
    print("║          🎮 REMOTE OBSCURE SERVER 🎮         ║")
    print("╠══════════════════════════════════════════════╣")
    print(f"║  Porta: {config.PORT:<36} ║")
    print(f"║  Senha: {config.PASSWORD:<36} ║")
    print("║                                              ║")
    print("║  Conecte usando um dos IPs abaixo:           ║")
    for ip in ips:
        url = f"ws://{ip}:{config.PORT}"
        print(f"║  → {url:<41} ║")
    print("║                                              ║")
    print(f"║  FPS: {config.CAPTURE_FPS}  |  Qualidade: {config.CAPTURE_QUALITY}%  |  Escala: {config.CAPTURE_SCALE}  ║")
    print("╠══════════════════════════════════════════════╣")
    print("║  Aguardando conexão...                       ║")
    print("╚══════════════════════════════════════════════╝")
    print()


async def send_json(ws: ServerConnection, data: dict):
    """Envia uma mensagem JSON para o cliente."""
    try:
        await ws.send(json.dumps(data))
    except Exception as e:
        logger.error(f"Erro ao enviar JSON: {e}")


async def stream_screen(ws: ServerConnection):
    """Loop de captura e envio de frames da tela."""
    frame_interval = 1.0 / config.CAPTURE_FPS
    logger.info(f"Iniciando stream (FPS: {config.CAPTURE_FPS}, Qualidade: {config.CAPTURE_QUALITY}%)")

    while True:
        start_time = time.monotonic()
        try:
            # Captura o frame
            frame_bytes = screen_capture.capture_frame()

            # Envia como mensagem binária
            await ws.send(frame_bytes)

            # Calcula o tempo de espera para manter o FPS
            elapsed = time.monotonic() - start_time
            sleep_time = max(0, frame_interval - elapsed)
            if sleep_time > 0:
                await asyncio.sleep(sleep_time)

        except websockets.exceptions.ConnectionClosed:
            logger.info("Conexão fechada durante stream")
            break
        except Exception as e:
            logger.error(f"Erro no stream: {e}")
            await asyncio.sleep(0.1)


async def handle_message(ws: ServerConnection, message: str):
    """Processa uma mensagem de controle do cliente."""
    try:
        data = json.loads(message)
        msg_type = data.get("type", "")

        if msg_type == "mouse_move":
            input_control.move_mouse(data["x"], data["y"])

        elif msg_type == "mouse_move_relative":
            input_control.move_mouse_relative(data["dx"], data["dy"])

        elif msg_type == "mouse_click":
            input_control.click(data.get("x"), data.get("y"), data.get("button", "left"))

        elif msg_type == "mouse_down":
            input_control.mouse_down(data.get("button", "left"))

        elif msg_type == "mouse_up":
            input_control.mouse_up(data.get("button", "left"))

        elif msg_type == "mouse_double_click":
            input_control.double_click(data["x"], data["y"])

        elif msg_type == "mouse_scroll":
            input_control.scroll(data["delta"])

        elif msg_type == "key_press":
            input_control.press_key(data["key"])

        elif msg_type == "key_combo":
            input_control.key_combo(data["keys"])

        elif msg_type == "key_special":
            input_control.press_special(data["key"])

        elif msg_type == "system":
            action = data["action"]
            logger.warning(f"Comando do sistema recebido: {action}")
            success, message_text = system_commands.execute(action)
            await send_json(ws, {
                "type": "system_result",
                "action": action,
                "success": success,
                "message": message_text,
            })

        elif msg_type == "programs_list":
            programs = program_manager.get_running_programs()
            await send_json(ws, {
                "type": "programs",
                "list": programs,
            })

        elif msg_type == "program_close":
            success, msg = program_manager.close_program(data["pid"])
            await send_json(ws, {
                "type": "system_result",
                "action": "program_close",
                "success": success,
                "message": msg,
            })

        elif msg_type == "program_open":
            success, msg = program_manager.open_program(data["path"])
            await send_json(ws, {
                "type": "system_result",
                "action": "program_open",
                "success": success,
                "message": msg,
            })

        else:
            logger.warning(f"Tipo de mensagem desconhecido: {msg_type}")

    except json.JSONDecodeError:
        logger.error(f"Mensagem JSON inválida: {message[:100]}")
    except KeyError as e:
        logger.error(f"Campo obrigatório ausente: {e}")
    except Exception as e:
        logger.error(f"Erro ao processar mensagem: {e}")
        await send_json(ws, {"type": "error", "message": str(e)})


async def handle_messages(ws: ServerConnection):
    """Loop de recebimento e processamento de mensagens do cliente."""
    async for message in ws:
        if isinstance(message, str):
            await handle_message(ws, message)
        # Ignora mensagens binárias do cliente (não esperadas)


async def handle_client(ws: ServerConnection):
    """Handler principal de conexão de um cliente."""
    global active_client

    remote = ws.remote_address
    logger.info(f"Nova conexão de: {remote}")

    # Se já tem um cliente conectado, desconecta o anterior
    if active_client is not None:
        logger.warning("Desconectando cliente anterior...")
        try:
            await active_client.close()
        except Exception:
            pass
        active_client = None

    try:
        # Aguarda mensagem de autenticação (timeout de 10s)
        try:
            auth_msg = await asyncio.wait_for(ws.recv(), timeout=10.0)
        except asyncio.TimeoutError:
            logger.warning(f"Timeout de autenticação para {remote}")
            await send_json(ws, {"type": "auth_result", "success": False})
            return

        # Valida a autenticação
        try:
            auth_data = json.loads(auth_msg)
        except (json.JSONDecodeError, TypeError):
            await send_json(ws, {"type": "auth_result", "success": False})
            return

        if auth_data.get("type") != "auth" or auth_data.get("password") != config.PASSWORD:
            logger.warning(f"Autenticação falhou para {remote}")
            await send_json(ws, {"type": "auth_result", "success": False})
            return

        # Autenticação bem-sucedida
        logger.info(f"✅ Cliente autenticado: {remote}")
        await send_json(ws, {"type": "auth_result", "success": True})

        # Envia informações da tela
        width, height = screen_capture.get_screen_size()
        await send_json(ws, {"type": "screen_info", "width": width, "height": height})

        # Marca como cliente ativo
        active_client = ws

        # Inicia stream e handler de mensagens em paralelo
        stream_task = asyncio.create_task(stream_screen(ws))
        messages_task = asyncio.create_task(handle_messages(ws))

        # Espera até que uma das tasks termine (desconexão)
        done, pending = await asyncio.wait(
            [stream_task, messages_task],
            return_when=asyncio.FIRST_COMPLETED,
        )

        # Cancela as tasks pendentes
        for task in pending:
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass

    except websockets.exceptions.ConnectionClosed:
        logger.info(f"Conexão fechada: {remote}")
    except Exception as e:
        logger.error(f"Erro com cliente {remote}: {e}")
    finally:
        if active_client is ws:
            active_client = None
        logger.info(f"🔌 Cliente desconectado: {remote}")


async def main():
    """Ponto de entrada do servidor."""
    print_banner()

    async with websockets.serve(
        handle_client,
        config.HOST,
        config.PORT,
        max_size=None,
        ping_interval=20,
        ping_timeout=10,
    ):
        logger.info(f"Servidor iniciado em {config.HOST}:{config.PORT}")
        await asyncio.Future()  # Roda para sempre


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Servidor encerrado pelo usuário")
    finally:
        screen_capture.close()
