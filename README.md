<div align="center">

# ðŸ–¥ï¸ Remote Obscure

**Controle Total do seu Computador na Palma da sua MÃ£o.**

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)](#)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](#)
[![WebSocket](https://img.shields.io/badge/WebSocket-000000?style=for-the-badge&logo=socket.io&logoColor=white)](#)

*Um aplicativo moderno, rÃ¡pido e de cÃ³digo aberto para acesso remoto.*

[Como Funciona](#-como-funciona) Â· [Funcionalidades](#-funcionalidades) Â· [InstalaÃ§Ã£o](#-instalaÃ§Ã£o-rÃ¡pida) Â· [Privacidade e SeguranÃ§a](#-privacidade-e-seguranÃ§a)

</div>

---

**Remote Obscure** Ã© um sistema completo (Aplicativo + Servidor) que permite visualizar e controlar a tela do seu computador pelo seu celular em tempo real, como um trackpad gigante, e executar comandos essenciais a distÃ¢ncia, sem depender de nuvens ou serviÃ§os pagos. Todo o trÃ¡fego acontece diretamente via Wi-Fi (ou ngrok/tunnel).

## âœ¨ Funcionalidades

### ðŸ“± Aplicativo (React Native / Expo)
- **VisualizaÃ§Ã£o em Tempo Real:** Assista Ã  tela do PC com alta taxa de quadros e latÃªncia mÃ­nima.
- **Mouse Trackpad:** Controle o mouse usando a tela do celular como um trackpad moderno (movimento relativo, dois toques para arrastar).
- **Interface Glassmorphism:** Design escuro premium com SafeArea total e Ã­cones nativos SVG (MaterialDesign).
- **Teclado Virtual:** Teclado na tela em forma de *overlay* translÃºcido com setas e atalhos (`Ctrl`, `Alt`, `Win`, `Shift`).
- **Gerenciador de Tarefas:** Liste todos os programas abertos, feche os que travaram, ou inicie aplicativos novos com um toque (ex: `notepad`, `calc.exe`, `chrome`).
- **Comandos RÃ¡pidos e MÃ­dia:** 
  - Controle de volume e reprodutor de mÃ­dia (Play/Pause, PrÃ³xima, Anterior).
  - Comandos de Energia (Desligar, Reiniciar, Suspender e Bloquear PC).

### ðŸ–¥ï¸ Servidor (Python)
- **Captura UltrarrÃ¡pida:** Usa `mss` (Multi-Screen Simulator) para capturar a tela sem consumir muita CPU.
- **Controle Preciso:** Usa `pyautogui` e `pynput` para traduzir o toque do celular em aÃ§Ãµes fiÃ©is de mouse e teclado.
- **ConexÃ£o WebSocket:** MantÃ©m a conexÃ£o persistente pela porta `8765`.
- **Limpeza AutomÃ¡tica:** Conta com um script `start.bat` que detecta e remove processos travados antes de iniciar, garantindo conexÃ£o perfeita.

---

## ðŸš€ InstalaÃ§Ã£o RÃ¡pida

### 1. Preparando o Servidor (No PC)
Certifique-se de que o [Python 3](https://www.python.org/downloads/) esteja instalado.

```bash
# Navegue atÃ© a pasta do servidor
cd server

# Instale os requisitos
pip install -r requirements.txt

# Inicie o servidor
start.bat
```
*(O `start.bat` vai limpar portas presas e rodar o `main.py` de forma autÃ´noma)*.

### 2. Rodando o Aplicativo (No Celular)
Certifique-se de que o [Node.js](https://nodejs.org/) esteja instalado no seu PC e que vocÃª tenha o app **Expo Go** no celular.

```bash
# Navegue atÃ© a pasta do aplicativo
cd app

# Instale as dependÃªncias
npm install

# Inicie o servidor do Expo
npx expo start --tunnel
```
Use o celular para ler o **QR Code** gerado no terminal.
Ao abrir o app, digite o **IP do PC** e a senha (a senha padrÃ£o Ã© `remote123`, veja como alterar abaixo).

---

## ðŸ”’ Privacidade e SeguranÃ§a
Este projeto foi construÃ­do pensando 100% em seguranÃ§a local.
- O seu endereÃ§o IP, sua tela e seus toques nÃ£o passam por nenhum servidor de terceiros.
- Nenhuma chave de API ou Token pessoal estÃ¡ armazenado ou *hardcoded* neste repositÃ³rio.
- **AtenÃ§Ã£o:** O arquivo `server/config.py` vem com a senha de exemplo `remote123`. Para uso pessoal e contÃ­nuo, lembre-se de mudar essa senha antes de comeÃ§ar a usar!

---

<div align="center">
Feito com â¤ï¸ para facilitar a vida de quem nÃ£o quer levantar da cama para pausar o filme.
</div>

