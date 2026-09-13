# InoveCloud OS - Debian 13 (Trixie) GNOME Liquid Glass Live ISO

Kit completo para compilar o **InoveCloud OS** como um sistema operacional Linux completo e independente, baseado em **Debian 13 (Trixie)** com ambiente desktop **GNOME 46+ Liquid Glass Theme**, wallpapers 8K/4K nativos, ícones translúcidos, dock flutuante e integração nativa com o ecossistema InoveCloud.

---

## 🏗️ Arquitetura do Sistema Operacional

- **Base**: Debian GNU/Linux 13 (Trixie) Minimal x86_64
- **Ambiente Desktop**: GNOME Shell 46+ com Wayland (Mutter)
- **Tema Visual**: **InoveCloud Liquid Glass Theme** (GTK4 + GNOME Shell com blur, painel translúcido `backdrop-filter`, dock flutuante e acentos carmesim)
- **Papéis de Parede**: Coleção completa integrada diretamente em `/usr/share/backgrounds/inovecloud/` com registro XML no GNOME Settings
- **Ícones & Fontes**: Papirus-Dark, Plus Jakarta Sans e JetBrains Mono
- **Gerenciamento de Pacotes**: APT (repositórios Debian 13 Trixie) + Flathub / Flatpak
- **Servidor Local**: Node.js servindo o Web Desktop e Control Plane em `http://127.0.0.1:3000` via Systemd (`inovecloud.service`)
- **Compatibilidade de Boot**: GRUB2 Híbrido (suporte nativo para UEFI 64-bit e BIOS Legacy)

---

## 🚀 Como Gerar a ISO

### Opção 1: Automático pelo GitHub Actions (100% na Nuvem) - *Recomendado*

O repositório já inclui o arquivo `.github/workflows/build-iso.yml`.

1. Envie o projeto para o seu repositório no GitHub:
   ```bash
   git push origin main
   ```
2. No seu repositório no GitHub, clique na aba **Actions**.
3. Selecione o workflow **Build InoveCloud OS 2026 - Debian 13 GNOME Glass ISO** e acompanhe a compilação.
4. Ao finalizar, baixe o arquivo `inovecloud-os-debian13-gnome-amd64.iso` na seção **Artifacts** ou **Releases**!

---

### Opção 2: Diretamente no Linux (Ubuntu 22.04+, Debian ou WSL2)

```bash
# 1. No diretório raiz do projeto, compile a aplicação web:
npm run build

# 2. Torne o script executável e execute como root:
chmod +x iso-builder/build-iso.sh
sudo ./iso-builder/build-iso.sh
```

A ISO pronta estará disponível em:
`dist-iso/inovecloud-os-debian13-gnome-amd64.iso`

---

### Opção 3: Usando Docker (Windows, Mac, Linux)

Sem precisar instalar ferramentas adicionais no seu host:

```bash
# 1. Compile o container builder
docker build -t inovecloud-iso-builder -f iso-builder/Dockerfile iso-builder/

# 2. Execute para compilar e salvar a ISO na pasta dist-iso local
mkdir -p dist-iso
docker run --privileged --rm -v $(pwd)/dist-iso:/output inovecloud-iso-builder
```

---

## 💾 Gravando no Pendrive para dar Boot

### No Windows:
1. Baixe o [Rufus](https://rufus.ie/) ou [BalenaEtcher](https://etcher.balena.io/).
2. Conecte seu Pendrive (mínimo 4 GB).
3. Selecione o arquivo `inovecloud-os-debian13-gnome-amd64.iso`.
4. Clique em **Iniciar / Flash!**.

### No Linux / Mac:
```bash
sudo dd if=dist-iso/inovecloud-os-debian13-gnome-amd64.iso of=/dev/sdX bs=4M status=progress oflag=sync
```
*(Substitua `/dev/sdX` pelo identificador do seu pendrive, ex: `/dev/sdb`)*.

---

## 🖥️ Testando em Máquinas Virtuais (VirtualBox, Proxmox, VMware)

- **Tipo de SO**: Linux
- **Versão**: Debian (64-bit)
- **Memória RAM**: 2048 MB a 4096 MB (2 a 4 GB)
- **Processador**: 2 vCPUs ou mais
- **Aceleração Gráfica**: Habilite aceleração 3D (VMSVGA) com 128 MB de VRAM
