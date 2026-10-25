# InoveCloud OS - Pure Kernel 7.3 RT Real PC Live ISO (~650 MB)

Kit oficial para compilar o **InoveCloud OS** como um sistema operacional robusto para PC real baseado no **Kernel Linux 7.3 RT Puro (LFS / Bare-Metal)**, com suporte completo a drivers de hardware (Wi-Fi, Bluetooth, GPU Mesa 3D, PipeWire audio, NVMe, USB), **Zero Debian** e **Zero GNOME**.

## 🚀 Características da ISO Real PC:
- **Tamanho**: ~650 MB (Equilíbrio perfeito entre leveza e compatibilidade total de hardware para PC real).
- **Kernel**: Linux 7.3 RT Real-Time (`vmlinuz-7.3.0-inovecloud-rt`) com módulos de drivers e firmwares integrados.
- **Conectividade & Som**: Suporte a Wi-Fi, Bluetooth LE, ALSA e PipeWire.
- **Gráficos**: Aceleração 3D Mesa 3D e renderização DRM/KMS.

## 🛠️ Como Compilar a ISO Real PC (~650 MB):
```bash
sudo ./iso-builder/build-iso.sh
```
A imagem ISO gerada estará disponível em `dist-iso/inovecloud-os-kernel-pure-7.3-realpc-amd64.iso`.
