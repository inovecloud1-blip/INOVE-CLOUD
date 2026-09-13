# Manual Oficial de Instalação e Criação da ISO - InoveCloud OS
**Versão:** 2026.1 (Debian 13 Trixie — GNOME Liquid Glass Desktop)  
**Idioma:** Português do Brasil (PT-BR)

---

## 1. O que é o InoveCloud OS?

O **InoveCloud OS** é um sistema operacional Linux completo construído sobre a base do **Debian 13 (Trixie)** com interface desktop **GNOME 46+ (Wayland / X11)**, equipado de fábrica com:
- **Identidade Visual Liquid Glass (Dark Mode)**: Painéis translúcidos com efeito de vidro fosco (frosted glass), bordas reflexivas e cantos suaves.
- **Dock Centralizada na Parte Inferior**: Estilo flutuante moderno com atalhos padrão fixados (Nautilus, Terminal GNOME, Navegador Chromium, Loja de Apps / GNOME Software e Central de Controle).
- **Top Bar Translúcida**: Com relógio centralizado, status do sistema e menu rápido de energia e rede.
- **Integração Nativa com Flathub**: Suporte completo a Flatpaks e repositórios oficiais Debian APT.
- **Modo Live USB Híbrido**: Inicialização rápida em qualquer computador com UEFI ou BIOS Legacy sem necessidade de instalação prévia no disco rígido.

---

## 2. Requisitos do Sistema

### Para Gerar a ISO (Computador de Compilação):
- **Sistema Operacional:** Linux (Ubuntu 22.04+, Debian 12+, Fedora, Arch) OU Windows/macOS com Docker Desktop / GitHub Actions.
- **Espaço em Disco:** Mínimo de 8 GB livres (para o chroot, pacotes GNOME e ferramentas temporárias).
- **Conexão de Internet:** Necessária para baixar pacotes oficiais do Debian Trixie e repositórios Flathub.

### Para Rodar o InoveCloud OS (PC Real ou Máquina Virtual):
- **Processador:** x86_64 (64-bit) Intel ou AMD (Dual-Core ou superior).
- **Memória RAM:** 
  - Mínimo: 2 GB RAM.
  - Recomendado: 4 GB RAM ou mais.
- **Placa de Vídeo / Vídeo Integrado:** Intel HD/UHD/Iris Graphics, AMD Radeon ou Nvidia (suporte a OpenGL/Vulkan via Mesa).
- **Pendrive:** Mínimo 4 GB (para gravação da ISO).
- **Armazenamento:** Roda 100% em modo Live na memória RAM ou pode ser instalado no HD/SSD.

---

## 3. Método 1: Gerando a ISO no Linux (Ubuntu, Debian ou WSL2)

Este é o método direto via terminal:

### Passo 1: Acesse a pasta do projeto
```bash
cd inovecloud-os
```

### Passo 2: Dê permissão de execução ao script de build
```bash
chmod +x iso-builder/build-iso.sh
```

### Passo 3: Execute a compilação com privilégios de root (sudo)
```bash
sudo ./iso-builder/build-iso.sh
```

### Passo 4: Localize a ISO gerada
Ao término das 7 etapas, a ISO inicializável pronta estará em:
```bash
dist-iso/inovecloud-os-debian13-gnome-amd64.iso
```

---

## 4. Método 2: Gerando a ISO via Docker (Windows, Mac ou Linux)

Se você estiver no Windows ou não quiser instalar ferramentas de compilação no seu sistema operacional principal:

### Passo 1: Construa a imagem do builder
```bash
docker build -t inovecloud-iso-builder -f iso-builder/Dockerfile iso-builder/
```

### Passo 2: Crie a pasta de saída e execute o container
```bash
mkdir -p dist-iso
docker run --privileged --rm -v $(pwd)/dist-iso:/output inovecloud-iso-builder
```

A ISO será gravada diretamente na sua pasta local `dist-iso/inovecloud-os-debian13-gnome-amd64.iso`.

---

## 5. Método 3: Compilação Automática na Nuvem (GitHub Actions)

Você não precisa gastar o processamento da sua máquina:

1. Suba o projeto para o seu repositório no GitHub:
   ```bash
   git add .
   git commit -m "Compilar ISO InoveCloud OS Debian 13 GNOME"
   git push origin main
   ```
2. No seu navegador, acesse a aba **Actions** do seu repositório no GitHub.
3. O workflow `Build InoveCloud OS ISO (Debian 13 Trixie + GNOME Glass)` começará a rodar automaticamente.
4. Ao concluir, clique na execução e baixe o arquivo em **Artifacts > inovecloud-os-debian13-gnome-amd64**.

---

## 6. Gravando a ISO no Pendrive

### Opção A: Usando o Rufus (Recomendado para Windows)
1. Conecte o seu pendrive (mínimo 4 GB).
2. Abra o [Rufus](https://rufus.ie/).
3. Em **Dispositivo**, selecione seu pendrive.
4. Em **Seleção de boot**, clique em **SELECIONAR** e escolha `inovecloud-os-debian13-gnome-amd64.iso`.
5. Em **Esquema de partição**, escolha **GPT** (para computadores novos UEFI) ou **MBR** (para computadores antigos BIOS).
6. Clique em **INICIAR** e escolha o modo recomendado (Modo Imagem ISO ou DD).

### Opção B: Usando o BalenaEtcher (Windows, macOS e Linux)
1. Baixe o [BalenaEtcher](https://etcher.balena.io/).
2. Clique em **Flash from file** e selecione o arquivo `.iso`.
3. Clique em **Select target** e marque o seu pendrive.
4. Clique em **Flash!** e aguarde a gravação e validação.

### Opção C: Usando o Terminal Linux (`dd`)
> ⚠️ **Atenção:** Certifique-se da letra correta da unidade (`/dev/sdX`) para não sobrescrever seu HD!
```bash
# Verifique o identificador do pendrive
lsblk

# Grave a imagem (substitua /dev/sdX pelo seu pendrive, ex: /dev/sdb)
sudo dd if=dist-iso/inovecloud-os-debian13-gnome-amd64.iso of=/dev/sdX bs=4M status=progress oflag=sync
```

### Opção D: Usando o Ventoy (O mais prático)
Se você já usa o **Ventoy** no pendrive, basta apenas copiar e colar o arquivo `inovecloud-os-debian13-gnome-amd64.iso` diretamente dentro da partição do pendrive.

---

## 7. Dando Boot no Computador Real

1. Conecte o pendrive gravado no computador desligado.
2. Ligue o computador e pressione repetidamente a tecla de menu de boot:
   - **Dell:** `F12`
   - **HP:** `F9` ou `Esc`
   - **Lenovo:** `F12` ou botão Novo
   - **Asus:** `F8` ou `Esc`
   - **Gigabyte / Placas-Mãe:** `F12`
3. Selecione o seu pendrive na lista de inicialização (prefira a opção com **UEFI**).
4. No menu do GRUB do InoveCloud OS, selecione:
   - `InoveCloud OS (Debian 13 Trixie — GNOME Glass Desktop)`
5. O sistema carregará o kernel Linux 6.12+, iniciará o GDM3 e fará autologin direto na sessão gráfica do GNOME com a Dock flutuante, Nautilus, Terminal, Chromium, GNOME Software (Flathub) e o tema Liquid Glass ativado!

---

## 8. Testando em Máquinas Virtuais

### No VirtualBox:
1. Abra o VirtualBox e clique em **Novo**.
2. **Nome:** InoveCloud OS (Debian 13)
3. **Tipo:** Linux | **Versão:** Debian (64-bit)
4. **Memória Base:** 2048 MB (2 GB) ou 4096 MB (4 GB).
5. **Processadores:** 2 CPUs ou mais.
6. **Armazenamento:** Selecione o arquivo `inovecloud-os-debian13-gnome-amd64.iso` no leitor de CD.
7. Em **Configurações > Monitor**:
   - Memória de Vídeo: 128 MB
   - Controlador Gráfico: **VMSVGA**
   - Habilite: **Aceleração 3D**.
8. Inicie a máquina virtual!

---

## 9. Credenciais Padrão da Sessão Live
- **Usuário Live:** `inove`
- **Senha:** `inove` (possui privilégios sudo totais sem senha)
- **Root:** `root` (senha: `inovecloud`)

---
*Desenvolvido para InoveCloud OS — Distribuição Linux Moderna & Infraestrutura de Nuvem.*
