# Guia Oficial: Como Compilar e Rodar o InoveCloud OS Kernel 7.3 RT Puro (LFS 1,5 GB)

Este guia explica detalhadamente a arquitetura autônoma do InoveCloud OS, que **não utiliza Debian, Ubuntu ou GNOME**, sendo um sistema operacional baseado no **Kernel Linux 7.3 RT Puro** compilado do zero.

---

## 1. Arquitetura do Sistema
- **Kernel:** `vmlinuz-7.3.0-inovecloud-rt-pure` (x86_64 SMP PREEMPT_RT)
- **Init System:** `/sbin/inove-init` (PID 1 nativo em Ring 0)
- **Interface Gráfica:** Compositor Liquid Glass via DRM/KMS Framebuffer direto (Sem GNOME, sem X11 pesado).
- **Tamanho da ISO:** ~1.5 GB (RootFS completo com ferramentas de desenvolvimento GCC 15, Rustc 1.85, áudio PipeWire e Wi-Fi).

---

## 2. Como Rodar no VirtualBox 7.x (Sem Tela Preta e Sem GNOME)
1. Crie uma Máquina Virtual do tipo **Linux > Other Linux (64-bit)**.
2. Defina **4 GB de RAM** e **2 vCPUs**.
3. Em **Monitor / Vídeo**: Defina o Controlador Gráfico como **VMSVGA** e marque **Habilitar Aceleração 3D**.
4. Em **Armazenamento**: Anexe a ISO gerada `inovecloud-os-kernel-pure-7.3-amd64.iso` no controlador SATA.
5. Inicie a VM: O sistema fará o boot direto em Ring 0 no Console TTY1 ou na interface DRM/KMS.
