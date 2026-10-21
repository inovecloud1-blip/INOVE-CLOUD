# Manual Oficial de Instalação e Criação da ISO - InoveCloud OS
**Versão:** 2026.1 (InoveCloud OS — Kernel Linux 7.3 RT Puro • Standalone LFS de 1,5 GB)  
**Idioma:** Português do Brasil (PT-BR)

---

## 1. O que é o InoveCloud OS?

O **InoveCloud OS** é um sistema operacional Linux autônomo construído do zero no modelo **LFS (Linux From Scratch / Bare-Metal)**, alimentado pelo **Kernel Linux 7.3 Real-Time (RT) Puro**. Ele possui arquitetura 100% independente, **sem qualquer dependência de Debian, Ubuntu ou GNOME**, e traz de fábrica:
- **Kernel Linux 7.3 RT Autônomo**: Escalonador EEVDFv2 de alta precisão (< 1ms), JIT eBPF 2.0 e motor io_uring v3.
- **Interface Gráfica Nativa Direta (DRM/KMS)**: Compositor Liquid Glass renderizado diretamente no framebuffer acelerado por hardware via Mesa 3D, sem gerenciadores de janela pesados ou GNOME.
- **Console TTY1 Bare-Metal Ring 0**: Acesso direto via comandos em modo texto ou transição instantânea via atalho `Ctrl + Alt + F7`.
- **Gerenciador de Pacotes DPKG & AppImage FUSE 3**: Compatível com instalação de binários `.deb`, pacotes portáteis e Flathub.
- **Conectividade Total de Fábrica**: Suporte a Wi-Fi 6E/7, Bluetooth 5.4 LE, servidor de áudio PipeWire de baixa latência e subsistema de impressão CUPS.

---

## 2. Requisitos do Sistema

### Para Gerar a ISO (Computador de Compilação):
- **Sistema Operacional:** Qualquer distribuição Linux limpa ou ambiente de compilação C/Rust.
- **Espaço em Disco:** Mínimo de 8 GB livres.
- **Conexão de Internet:** Necessária para baixar os fontes do Kernel Linux 7.3 e BusyBox.

### Para Rodar o InoveCloud OS (PC Real ou Máquina Virtual):
- **Processador:** x86_64 (64-bit) Intel ou AMD.
- **Memória RAM:** Mínimo de 1 GB a 2 GB (consumo real em idle inferior a 180 MB).
- **Controlador Gráfico (VirtualBox/QEMU):** VMSVGA com Aceleração 3D ativada.
- **Pendrive:** Mínimo de 2 GB (para a ISO de 1,5 GB).

---

## 3. Método 1: Compilando a ISO do Zero no Linux
O script `build-inovecloud.sh` compila o Kernel Linux 7.3 RT Puro e monta o RootFS LFS standalone de 1,5 GB:

### Passo 1: Acesse a pasta do projeto e dê permissão
```bash
chmod +x build-inovecloud.sh
```

### Passo 2: Execute o script de compilação como root
```bash
sudo ./build-inovecloud.sh
```

### Passo 3: Localize a ISO gerada
A imagem ISO inicializável de 1,5 GB estará pronta em:
```bash
dist-iso/inovecloud-os-kernel-pure-7.3-amd64.iso
```

---

## 4. Gravando a ISO no Pendrive
Use o **Rufus**, **BalenaEtcher** ou **Ventoy** para gravar a ISO `inovecloud-os-kernel-pure-7.3-amd64.iso` no pendrive e dar boot direto em modo UEFI/BIOS.
