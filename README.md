<div align="center">

# 🖥️ Remote Obscure

**Controle Total do seu Computador na Palma da sua Mão.**

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)](#)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](#)
[![WebSocket](https://img.shields.io/badge/WebSocket-000000?style=for-the-badge&logo=socket.io&logoColor=white)](#)

*Um aplicativo moderno, rápido e de código aberto para acesso remoto.*

[Como Funciona](#-como-funciona) · [Funcionalidades](#-funcionalidades) · [Instalação](#-instalação-rápida) · [Privacidade e Segurança](#-privacidade-e-segurança)

</div>

---

**Remote Obscure** é um sistema completo (Aplicativo + Servidor) que permite visualizar e controlar a tela do seu computador pelo seu celular em tempo real, como um trackpad gigante, e executar comandos essenciais a distância, sem depender de nuvens ou serviços pagos. Todo o tráfego acontece diretamente via Wi-Fi (ou ngrok/tunnel).

## ✨ Funcionalidades

### 📱 Aplicativo (React Native / Expo)
- **Visualização em Tempo Real:** Assista à tela do PC com alta taxa de quadros e latência mínima.
- **Mouse Trackpad:** Controle o mouse usando a tela do celular como um trackpad moderno (movimento relativo, dois toques para arrastar).
- **Interface Glassmorphism:** Design escuro premium com SafeArea total e ícones nativos SVG (MaterialDesign).
- **Teclado Virtual:** Teclado na tela em forma de *overlay* translúcido com setas e atalhos (`Ctrl`, `Alt`, `Win`, `Shift`).
- **Gerenciador de Tarefas:** Liste todos os programas abertos, feche os que travaram, ou inicie aplicativos novos com um toque (ex: `notepad`, `calc.exe`, `chrome`).
- **Comandos Rápidos e Mídia:** 
  - Controle de volume e reprodutor de mídia (Play/Pause, Próxima, Anterior).
  - Comandos de Energia (Desligar, Reiniciar, Suspender e Bloquear PC).

### 🖥️ Servidor (Python)
- **Captura Ultrarrápida:** Usa `mss` (Multi-Screen Simulator) para capturar a tela sem consumir muita CPU.
- **Controle Preciso:** Usa `pyautogui` e `pynput` para traduzir o toque do celular em ações fiéis de mouse e teclado.
- **Conexão WebSocket:** Mantém a conexão persistente pela porta `8765`.
- **Limpeza Automática:** Conta com um script `start.bat` que detecta e remove processos travados antes de iniciar, garantindo conexão perfeita.

---

## 🚀 Instalação Rápida

### 1. Preparando o Servidor (No PC)
Certifique-se de que o [Python 3](https://www.python.org/downloads/) esteja instalado.

```bash
# Navegue até a pasta do servidor
cd server

# Instale os requisitos
pip install -r requirements.txt

# Inicie o servidor
start.bat
```
*(O `start.bat` vai limpar portas presas e rodar o `main.py` de forma autônoma)*.

### 2. Rodando o Aplicativo (No Celular)
Certifique-se de que o [Node.js](https://nodejs.org/) esteja instalado no seu PC e que você tenha o app **Expo Go** no celular.

```bash
# Navegue até a pasta do aplicativo
cd app

# Instale as dependências
npm install

# Inicie o servidor do Expo
npx expo start --tunnel
```
Use o celular para ler o **QR Code** gerado no terminal.
Ao abrir o app, digite o **IP do PC** e a senha (a senha padrão é `remote123`, veja como alterar abaixo).

---

## 🔒 Privacidade e Segurança
Este projeto foi construído pensando 100% em segurança local.
- O seu endereço IP, sua tela e seus toques não passam por nenhum servidor de terceiros.
- Nenhuma chave de API ou Token pessoal está armazenado ou *hardcoded* neste repositório.
- **Atenção:** O arquivo `server/config.py` vem com a senha de exemplo `remote123`. Para uso pessoal e contínuo, lembre-se de mudar essa senha antes de começar a usar!

---

<div align="center">
Feito com ❤️ para facilitar a vida de quem não quer levantar da cama para pausar o filme.
</div>
