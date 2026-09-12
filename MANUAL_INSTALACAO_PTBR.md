# Manual Oficial de Instalação e Criação da ISO - InoveCloud OS
**Versão:** 2026.1 (Debian 12 Bookworm Kiosk Appliance)  
**Idioma:** Português do Brasil (PT-BR)

---

## 1. Requisitos do Sistema

### Para Gerar a ISO (Computador de Compilação):
- **Sistema Operacional:** Linux (Ubuntu 20.04+, Debian 11+, Linux Mint) OU Windows/macOS com Docker Desktop.
- **Espaço em Disco:** Mínimo de 6 GB livres (para o chroot e ferramentas temporárias).
- **Conexão de Internet:** Necessária para baixar pacotes oficiais do Debian e dependências.

### Para Rodar o InoveCloud OS (PC Real ou Máquina Virtual):
- **Processador:** x86_64 (64-bit) Intel ou AMD (Dual-Core ou superior).
- **Memória RAM:** 
  - Mínimo: 2 GB RAM.
  - Recomendado: 4 GB RAM ou mais.
- **Placa de Vídeo / Vídeo Integrado:** Intel HD/UHD/Iris Graphics, AMD Radeon ou Nvidia (suporte a OpenGL/Vulkan via Mesa).
- **Pendrive:** Mínimo 2 GB (para gravação da ISO).
- **Armazenamento:** Não requer disco rígido obrigatório (roda em modo Live na memória RAM).

---

## 2. Método 1: Gerando a ISO no Linux (Ubuntu, Debian ou WSL2)

Este é o método direto via terminal:

### Passo 1: Acesse a pasta do projeto
```bash
cd inovecloud-os
```

### Passo 2: Instale as dependências da aplicação Web e faça o build
```bash
npm install
npm run build
```

### Passo 3: Dê permissão de execução ao script
```bash
chmod +x iso-builder/build-iso.sh
```

### Passo 4: Execute a compilação com privilégios de root (sudo)
```bash
sudo ./iso-builder/build-iso.sh
```

### Passo 5: Localize a ISO gerada
Ao término das 7 etapas, a ISO pronta estará em:
```bash
dist-iso/inovecloud-os-debian12-amd64.iso
```

---

## 3. Método 2: Gerando a ISO via Docker (Windows, Mac ou Linux)

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

A ISO será gravada diretamente na sua pasta local `dist-iso/`.

---

## 4. Método 3: Compilação Automática na Nuvem (GitHub Actions)

Você não precisa gastar o processamento da sua máquina:

1. Suba o projeto para o seu repositório no GitHub:
   ```bash
   git add .
   git commit -m "Compilar ISO InoveCloud OS"
   git push origin main
   ```
2. No seu navegador, acerte a aba **Actions** do seu repositório no GitHub.
3. O workflow `Build InoveCloud OS ISO` começará a rodar automaticamente.
4. Ao concluir, clique na execução e baixe o arquivo em **Artifacts > inovecloud-os-debian12-amd64**.

---

## 5. Gravando a ISO no Pendrive

### Opção A: Usando o Rufus (Recomendado para Windows)
1. Conecte o seu pendrive (mínimo 2 GB).
2. Abra o [Rufus](https://rufus.ie/).
3. Em **Dispositivo**, selecione seu pendrive.
4. Em **Seleção de boot**, clique em **SELECIONAR** e escolha `inovecloud-os-debian12-amd64.iso`.
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
sudo dd if=dist-iso/inovecloud-os-debian12-amd64.iso of=/dev/sdX bs=4M status=progress oflag=sync
```

### Opção D: Usando o Ventoy (O mais prático)
Se você já usa o **Ventoy** no pendrive, basta apenas copiar e colar o arquivo `inovecloud-os-debian12-amd64.iso` diretamente dentro da partição do pendrive.

---

## 6. Dando Boot no Computador Real

1. Conecte o pendrive gravado no computador desligado.
2. Ligue o computador e pressione repetidamente a tecla de menu de boot:
   - **Dell:** `F12`
   - **HP:** `F9` ou `Esc`
   - **Lenovo:** `F12` ou botão Novo
   - **Asus:** `F8` ou `Esc`
   - **Gigabyte / Placas-Mãe:** `F12`
3. Selecione o seu pendrive na lista de inicialização (prefira a opção com **UEFI**).
4. No menu do GRUB do InoveCloud OS, selecione:
   - `InoveCloud OS 2026 (Live Kiosk Appliance)`
5. O sistema carregará o kernel na memória RAM, iniciará o serviço do InoveCloud e abrirá diretamente na sua Launcher em tela cheia!

---

## 7. Testando em Máquinas Virtuais

### No VirtualBox:
1. Abra o VirtualBox e clique em **Novo**.
2. **Nome:** InoveCloud OS
3. **Tipo:** Linux | **Versão:** Debian (64-bit)
4. **Memória Base:** 2048 MB (2 GB) ou 4096 MB (4 GB).
5. **Processadores:** 2 CPUs.
6. **Disco Rígido:** Pode marcar "Não adicionar disco rígido virtual" (roda em Live).
7. Em **Configurações > Monitor**:
   - Memória de Vídeo: 128 MB
   - Controlador Gráfico: **VMSVGA**
   - Habilite a caixa: **Habilitar Aceleração 3D**.
8. Em **Configurações > Armazenamento**:
   - No drive óptico (CD), selecione o arquivo `inovecloud-os-debian12-amd64.iso`.
9. Inicie a máquina virtual!

### No Proxmox VE:
1. Crie uma nova VM (ID ex: 105).
2. Em **OS**: selecione o storage ISO e aponte para `inovecloud-os-debian12-amd64.iso`.
3. Em **System**: Máquina `q35`, BIOS `OVMF (UEFI)` ou `Default (SeaBIOS)`.
4. Em **CPU**: 2 cores (tipo: `host`).
5. Em **Memory**: 2048 MB a 4096 MB.
6. Em **Display**: selecione `VirtIO-GPU` ou `SPICE` para aceleração máxima.
7. Inicie a VM e abra o console NoVNC.

---

## 8. Dúvidas Frequentes & Troubleshooting

### O que fazer se a tela ficar preta no boot?
No menu inicial do GRUB, selecione a segunda opção:
`InoveCloud OS (Modo Seguro / Fallback VESA)`. Isso carrega o sistema sem aceleração KMS específica, compatível com placas de vídeo legadas.

### Como acessar o terminal de emergência no sistema ao vivo?
Pressione as teclas:
`Ctrl + Alt + F2` ou `Ctrl + Alt + F3`
Isso abre um terminal TTY tradicional do Linux. O usuário é `inove` com privilégios sudo.
Para voltar à interface gráfica da Launcher, pressione:
`Ctrl + Alt + F1`

### Como conectar ao Wi-Fi?
O sistema inclui o `NetworkManager`. Você pode conectar facilmente pelo terminal:
```bash
nmcli dev wifi connect "NomeDaSuaRede" password "SuaSenhaAqui"
```

---
*Desenvolvido para InoveCloud OS - Cloud Workspace & Infrastructure Management.*
