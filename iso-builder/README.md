# InoveCloud OS - Gerador de Imagem ISO Bootável (Debian 12 Live Kiosk)

Este diretório contém o kit completo para compilar o **InoveCloud OS** como um sistema operacional independente (Appliance Kiosk), que dá boot diretamente na sua interface Web/Launcher sem carregar ambientes de desktop pesados.

---

## 🏗️ Arquitetura do Sistema Operacional

- **Base**: Debian 12 (Bookworm) Minimal x86_64
- **Kernel**: `linux-image-amd64` com drivers de vídeo Mesa (Intel Iris/Xe, AMD Radeon e Nvidia)
- **Modo Kiosk**: Wayland Kiosk Compositor (**Cage**) + **Chromium** em tela cheia com aceleração de hardware por GPU
- **Servidor Local**: Node.js v20 LTS servindo a aplicação em `http://127.0.0.1:3000` via Systemd (`inovecloud.service`)
- **Compatibilidade de Boot**: GRUB2 Híbrido (suporte nativo para UEFI 64-bit e BIOS Legacy)

---

## 🚀 Como Gerar a ISO

### Opção 1: Diretamente no Linux (Ubuntu / Debian / WSL2)

```bash
# 1. No diretório raiz do projeto, compile a aplicação web:
npm run build

# 2. Torne o script executável e execute como root:
chmod +x iso-builder/build-iso.sh
sudo ./iso-builder/build-iso.sh
```

A ISO pronta estará disponível em `dist-iso/inovecloud-os-debian12-amd64.iso`.

---

### Opção 2: Usando Docker (Qualquer SO: Windows, Mac, Linux)

Sem precisar instalar ferramentas no seu computador:

```bash
# 1. Compile o container builder
docker build -t inovecloud-iso-builder -f iso-builder/Dockerfile iso-builder/

# 2. Execute para compilar e salvar a ISO na pasta dist-iso local
mkdir -p dist-iso
docker run --privileged --rm -v $(pwd)/dist-iso:/output inovecloud-iso-builder
```

---

### Opção 3: Automático pelo GitHub Actions (100% na Nuvem)

O repositório já conta com o arquivo `.github/workflows/build-iso.yml`.
Ao subir o projeto para o seu repositório no GitHub (`git push origin main`), o GitHub Actions compilará a ISO automaticamente e a disponibilizará na aba **Actions > Artifacts** para download direto!

---

## 💾 Gravando no Pendrive para dar Boot

### No Windows:
1. Baixe o [Rufus](https://rufus.ie/) ou [BalenaEtcher](https://etcher.balena.io/).
2. Conecte seu Pendrive (mínimo 2 GB).
3. Selecione o arquivo `inovecloud-os-debian12-amd64.iso`.
4. Clique em **Iniciar / Flash!**.

### No Linux / Mac:
```bash
sudo dd if=dist-iso/inovecloud-os-debian12-amd64.iso of=/dev/sdX bs=4M status=progress oflag=sync
```
*(Substitua `/dev/sdX` pelo identificador do seu pendrive, ex: `/dev/sdb`)*.

---

## 🖥️ Testando em Máquinas Virtuais (VirtualBox, Proxmox, VMware)

- **Tipo de SO**: Linux
- **Versão**: Debian (64-bit)
- **Memória RAM**: 2048 MB (2 GB) recomendado
- **Armazenamento**: Nenhum disco rígido é obrigatório (roda como Live OS na RAM)
- **Placa de Vídeo**: Habilite aceleração 3D ou VMSVGA com 128 MB de VRAM
