# Manual Oficial de Instalação e Criação da ISO - InoveCloud OS
**Versão:** 2026.1 (Ubuntu 24.04 LTS Noble — KDE Plasma 6 Breeze Dark Edition)  
**Idioma:** Português do Brasil (PT-BR)

---

## 1. O que é o InoveCloud OS?

O **InoveCloud OS** é um sistema operacional Linux completo construído sobre a base do **Ubuntu 24.04 LTS (Noble Numbat)** com interface desktop **KDE Plasma 6 (Wayland / X11)**, equipado de fábrica com:
- **Identidade Visual Liquid Glass (Breeze Dark Mode)**: Painéis com desfoque real nativo (*KWin background blur*), cantos suaves e alto contraste.
- **Dock Centralizada na Parte Inferior**: Estilo flutuante moderno com atalhos padrão fixados (**Dolphin**, **Konsole Terminal**, **Navegador Web**, **KDE Discover / Flathub** e **Configurações do Sistema**).
- **Top Bar Translúcida**: Com relógio digital, menu de aplicativos Kickoff, status de rede e menu de energia.
- **Suporte Total a Aplicativos**: Integração nativa com **Flathub**, **Snap** e repositórios **APT** oficiais do Ubuntu.
- **Modo Live USB Híbrido**: Inicialização ultrarrápida em qualquer computador com UEFI ou BIOS Legacy sem necessidade de instalação prévia no disco.

---

## 2. Requisitos do Sistema

### Para Gerar a ISO (Computador de Compilação):
- **Sistema Operacional:** Linux (Ubuntu 22.04+, Debian 12+, Fedora) OU GitHub Actions / Docker.
- **Espaço em Disco:** Mínimo de 8 GB livres (para o chroot e pacotes KDE).
- **Conexão de Internet:** Necessária para baixar pacotes oficiais do Ubuntu e Flathub.

### Para Rodar o InoveCloud OS (PC Real ou Máquina Virtual):
- **Processador:** x86_64 (64-bit) Intel ou AMD (Dual-Core ou superior).
- **Memória RAM:** 
  - Mínimo: 2 GB RAM.
  - Recomendado: 4 GB RAM ou mais (KDE Plasma consome apenas ~650 MB em idle).
- **Placa de Vídeo / Vídeo Integrado:** Intel HD/Iris/Xe, AMD Radeon ou Nvidia (suporte a OpenGL/Vulkan via Mesa).
- **Pendrive:** Mínimo 4 GB (para gravação da ISO).

---

## 3. Método 1: Gerando a ISO no Linux (Terminal Direto)

### Passo 1: Acesse a pasta do projeto
```bash
cd inovecloud-os
```

### Passo 2: Dê permissão de execução ao script de build
```bash
chmod +x build-inovecloud.sh
```

### Passo 3: Execute a compilação com privilégios de root (sudo)
```bash
sudo ./build-inovecloud.sh
```

### Passo 4: Localize a ISO gerada
Ao término das etapas, a ISO inicializável pronta estará em:
```bash
dist-iso/inovecloud-os-2026.1-ubuntu24-kde-amd64.iso
```

---

## 4. Método 2: Compilação Automática na Nuvem (GitHub Actions)

Você pode compilar a ISO diretamente pelos servidores gratuitos do GitHub:

1. Faça o commit e envie as alterações para o seu repositório:
   ```bash
   git add .
   git commit -m "Compilar ISO InoveCloud OS Ubuntu 24.04 KDE Plasma 6"
   git push origin main
   ```
2. No seu navegador, acesse a aba **Actions** do seu repositório no GitHub.
3. O workflow `Build InoveCloud OS 2026 - Ubuntu 24.04 KDE Plasma 6 ISO` será executado automaticamente.
4. Ao concluir, baixe a ISO pronta na seção **Artifacts** ou **Releases**.

---

## 5. Gravando a ISO no Pendrive

### Opção A: Usando o Rufus (Windows)
1. Conecte seu pendrive (mínimo 4 GB).
2. Abra o [Rufus](https://rufus.ie/).
3. Em **Dispositivo**, selecione seu pendrive.
4. Em **Seleção de boot**, selecione `inovecloud-os-2026.1-ubuntu24-kde-amd64.iso`.
5. Em **Esquema de partição**, escolha **GPT** (UEFI).
6. Clique em **INICIAR**.

### Opção B: Usando o BalenaEtcher (Windows, macOS e Linux)
1. Baixe o [BalenaEtcher](https://etcher.balena.io/).
2. Clique em **Flash from file** e selecione o arquivo `.iso`.
3. Selecione o seu pendrive e clique em **Flash!**.

### Opção C: Usando o Ventoy (O mais prático)
Se você usa o **Ventoy**, basta copiar o arquivo `inovecloud-os-2026.1-ubuntu24-kde-amd64.iso` diretamente para a raiz do seu pendrive Ventoy.

---

## 6. Dando Boot no Computador Real

1. Conecte o pendrive no computador desligado.
2. Ligue e pressione a tecla de menu de boot (`F12`, `F9`, `F8` ou `Esc` dependendo da marca da placa-mãe).
3. Selecione a opção correspondente ao seu pendrive (**UEFI**).
4. No menu GRUB, selecione:
   - `InoveCloud OS 2026.1 (Ubuntu 24.04 LTS - KDE Plasma 6 Live)`
5. O sistema carregará na memória RAM e fará login automático direto no **KDE Plasma 6** com tema Breeze Dark, Dock centralizada e Dolphin/Konsole prontos para uso.

---

## 7. Credenciais da Sessão Live
- **Usuário Live:** `inove`
- **Senha:** `inove` (possui privilégios `sudo` sem senha)
- **Root:** `root` (senha: `inovecloud`)

---
*InoveCloud OS — Distribuição Linux Moderna baseada em Ubuntu 24.04 LTS & KDE Plasma 6.*
