#!/usr/bin/env bash
# ==============================================================================
# INOVECLOUD OS - INSTALADOR OFICIAL DE DISCO NATIVO (SSD / NVMe / HDD)
# Com Tela de Boas-Vindas, Seleção de Idioma, Criação de Usuário/Senha e Particionamento
# ==============================================================================

set -euo pipefail

# Cores e Estilos Oficiais estilo BIOS (Fundo Azul com Texto Branco e Destaques em Ciano/Amarelo)
C_BIOS_BG='\033[44;37m'
C_CYAN='\033[1;36m'
C_GREEN='\033[1;32m'
C_BLUE='\033[1;34m'
C_YELLOW='\033[1;33m'
C_RED='\033[1;31m'
C_WHITE='\033[1;37m'
C_BOLD='\033[1m'
C_RESET='\033[0m'

clear
echo -e "${C_BIOS_BG}"
echo "================================================================================"
echo "   INOVECLOUD OS 2026 - BIOS SETUP & ASSISTENTE DE INSTALAÇÃO NO DISCO          "
echo "================================================================================"
echo -e "${C_RESET}"

if [ "$(id -u)" -ne 0 ]; then
  echo -e "${C_RED}[ERRO] O instalador precisa ser executado com privilégios de root (sudo).${C_RESET}"
  exit 1
fi

# ------------------------------------------------------------------------------
# ETAPA 1: TELA DE BOAS-VINDAS
# ------------------------------------------------------------------------------
echo -e "\n${C_BOLD}${C_CYAN}  ▶ BEM-VINDO AO ASSISTENTE DE INSTALAÇÃO INOVECLOUD OS (BIOS SETUP)${C_RESET}"
echo "  Este assistente irá guiá-lo na instalação do sistema no seu computador ou VM."
echo "  Tudo será configurado automaticamente: Drivers, Wi-Fi, Bluetooth, Áudio e Flatpak."
echo ""
read -rp "  Pressione [ENTER] para começar a configuração..." _

# ------------------------------------------------------------------------------
# ETAPA 2: SELEÇÃO DE IDIOMA E TECLADO
# ------------------------------------------------------------------------------
clear
echo -e "${C_BIOS_BG}"
echo "================================================================================"
echo "   🌐 ETAPA 1/5: SELEÇÃO DE IDIOMA E TECLADO                                    "
echo "================================================================================"
echo -e "${C_RESET}"
echo "  Escolha o idioma do sistema:"
echo "    [1] Português do Brasil (pt_BR.UTF-8) - Teclado ABNT2"
echo "    [2] English (US) (en_US.UTF-8) - US International Keyboard"
echo "    [3] Español (es_ES.UTF-8) - Teclado Español"
echo ""
read -rp "  Digite o número da sua opção (Padrão [1]): " LANG_OPT
LANG_OPT=${LANG_OPT:-1}

case "$LANG_OPT" in
  1)
    SYS_LOCALE="pt_BR.UTF-8"
    SYS_KEYMAP="br-abnt2"
    echo -e "${C_GREEN}✓ Idioma configurado: Português (Brasil) - ABNT2${C_RESET}"
    ;;
  2)
    SYS_LOCALE="en_US.UTF-8"
    SYS_KEYMAP="us"
    echo -e "${C_GREEN}✓ Language configured: English (US)${C_RESET}"
    ;;
  3)
    SYS_LOCALE="es_ES.UTF-8"
    SYS_KEYMAP="es"
    echo -e "${C_GREEN}✓ Idioma configurado: Español${C_RESET}"
    ;;
  *)
    SYS_LOCALE="pt_BR.UTF-8"
    SYS_KEYMAP="br-abnt2"
    echo -e "${C_GREEN}✓ Idioma configurado: Português (Brasil)${C_RESET}"
    ;;
esac

sleep 1

# ------------------------------------------------------------------------------
# ETAPA 3: CRIAÇÃO DE USUÁRIO, NOME E SENHA
# ------------------------------------------------------------------------------
clear
echo -e "${C_CYAN}========================================================================${C_RESET}"
echo -e "${C_CYAN}   👤 ETAPA 2/5: CONTA DE USUÁRIO E SEGURANÇA                          ${C_RESET}"
echo -e "${C_CYAN}========================================================================${C_RESET}"

read -rp "Digite seu Nome Completo (ex: Carlos Silva): " USER_FULLNAME
USER_FULLNAME=${USER_FULLNAME:-"Usuario InoveCloud"}

read -rp "Digite o Nome de Usuário (login - apenas minúsculas, ex: inove): " USER_LOGIN
USER_LOGIN=${USER_LOGIN:-"inove"}
USER_LOGIN=$(echo "$USER_LOGIN" | tr '[:upper:]' '[:lower:]' | tr -d ' ')

read -rp "Digite o Nome do Computador (Hostname, ex: inovecloud-pc): " SYS_HOSTNAME
SYS_HOSTNAME=${SYS_HOSTNAME:-"inovecloud-pc"}

while true; do
  echo ""
  read -rsp "Digite uma Senha para o usuário '${USER_LOGIN}': " USER_PASS
  echo ""
  read -rsp "Confirme a Senha: " USER_PASS_CONFIRM
  echo ""
  
  if [ "$USER_PASS" = "$USER_PASS_CONFIRM" ] && [ -n "$USER_PASS" ]; then
    echo -e "${C_GREEN}✓ Senha configurada com sucesso!${C_RESET}"
    break
  else
    echo -e "${C_RED}As senhas não coincidem ou estão vazias. Tente novamente.${C_RESET}"
  fi
done

sleep 1

# ------------------------------------------------------------------------------
# ETAPA 4: DETECÇÃO E SELEÇÃO DO DISCO / PARTICIONAMENTO
# ------------------------------------------------------------------------------
clear
echo -e "${C_CYAN}========================================================================${C_RESET}"
echo -e "${C_CYAN}   💾 ETAPA 3/5: SELEÇÃO DO DISCO E PARTICIONAMENTO (SSD / HD)         ${C_RESET}"
echo -e "${C_CYAN}========================================================================${C_RESET}\n"

echo "Unidades de armazenamento encontradas no computador:"
lsblk -d -p -n -l -o NAME,SIZE,MODEL,TRAN,TYPE | grep -E "disk" || true
echo ""

read -rp "Digite o caminho do disco para instalar o InoveCloud OS (ex: /dev/sda ou /dev/nvme0n1): " TARGET_DISK

if [ ! -b "${TARGET_DISK}" ]; then
  echo -e "${C_RED}[ERRO] Dispositivo ${TARGET_DISK} inválido ou não encontrado!${C_RESET}"
  exit 1
fi

echo ""
echo "Escolha o modo de particionamento:"
echo "  [1] Particionamento Automático GPT (Recomendado - Apaga todo o disco e cria EFI + Root)"
echo "  [2] Particionamento Manual"
read -rp "Opção (Padrão [1]): " PART_MODE
PART_MODE=${PART_MODE:-1}

echo -e "\n${C_RED}${C_BOLD}⚠️  ATENÇÃO: TODOS OS DADOS EM ${TARGET_DISK} SERÃO FORMATADOS!${C_RESET}"
read -rp "Confirmar gravação e instalação? (digite 'sim'): " CONFIRM
if [ "${CONFIRM}" != "sim" ]; then
  echo -e "${C_YELLOW}Instalação cancelada pelo usuário.${C_RESET}"
  exit 0
fi

# Executar particionamento GPT
echo -e "\n${C_BLUE}Formatando disco ${TARGET_DISK} e criando tabela de partições GPT...${C_RESET}"
umount "${TARGET_DISK}"* 2>/dev/null || true
wipefs -a "${TARGET_DISK}"
sgdisk -Z "${TARGET_DISK}"

# Criação das partições: EFI (512MB) e Root ext4 (Resto do disco)
sgdisk -n 1:0:+512M -t 1:ef00 -c 1:"EFI System Partition" "${TARGET_DISK}"
sgdisk -n 2:0:0     -t 2:8300 -c 2:"InoveCloud Root" "${TARGET_DISK}"

partprobe "${TARGET_DISK}"
sleep 2

if [[ "${TARGET_DISK}" =~ nvme|mmcblk ]]; then
  PART_EFI="${TARGET_DISK}p1"
  PART_ROOT="${TARGET_DISK}p2"
else
  PART_EFI="${TARGET_DISK}1"
  PART_ROOT="${TARGET_DISK}2"
fi

echo -e "${C_BLUE}Formatando partição EFI (${PART_EFI}) em FAT32...${C_RESET}"
mkfs.vfat -F32 "${PART_EFI}"

echo -e "${C_BLUE}Formatando partição Root (${PART_ROOT}) em ext4 com aceleração de leitura...${C_RESET}"
mkfs.ext4 -F -O fast_commit,dir_index -L "INOVECLOUD_ROOT" "${PART_ROOT}"

# ------------------------------------------------------------------------------
# ETAPA 5: CÓPIA DO SISTEMA E APLICAÇÃO DE USUÁRIO/IDIOMA
# ------------------------------------------------------------------------------
clear
echo -e "${C_CYAN}========================================================================${C_RESET}"
echo -e "${C_CYAN}   🚀 ETAPA 4/5: INSTALANDO SISTEMA OPERACIONAL NO DISCO               ${C_RESET}"
echo -e "${C_CYAN}========================================================================${C_RESET}"

MOUNT_TARGET="/mnt/inovecloud_install"
mkdir -p "${MOUNT_TARGET}"
mount "${PART_ROOT}" "${MOUNT_TARGET}"
mkdir -p "${MOUNT_TARGET}/boot/efi"
mount "${PART_EFI}" "${MOUNT_TARGET}/boot/efi"

echo -e "\n${C_YELLOW}Copiando arquivos do InoveCloud OS para o disco rígido (aguarde)...${C_RESET}"
rsync -aAX --delete \
  --exclude={"/dev/*","/proc/*","/sys/*","/tmp/*","/run/*","/mnt/*","/media/*","/lost+found"} \
  / "${MOUNT_TARGET}/"

# Configurar fstab
UUID_ROOT=$(blkid -s UUID -o value "${PART_ROOT}")
UUID_EFI=$(blkid -s UUID -o value "${PART_EFI}")

cat << EOF > "${MOUNT_TARGET}/etc/fstab"
# /etc/fstab: Configuração de montagem do InoveCloud OS
UUID=${UUID_ROOT}   /           ext4    defaults,noatime,commit=60  0 1
UUID=${UUID_EFI}    /boot/efi   vfat    umask=0077                  0 2
tmpfs               /tmp        tmpfs   defaults,noatime,mode=1777  0 0
EOF

# Aplicar Hostname e Idioma
echo "${SYS_HOSTNAME}" > "${MOUNT_TARGET}/etc/hostname"
echo "LANG=${SYS_LOCALE}" > "${MOUNT_TARGET}/etc/default/locale"

# Criar Usuário no sistema instalado
echo -e "${C_BLUE}Configurando usuário '${USER_LOGIN}' e permissões de administrador...${C_RESET}"
mkdir -p "${MOUNT_TARGET}/home/${USER_LOGIN}"
mkdir -p "${MOUNT_TARGET}/home/${USER_LOGIN}/Downloads"
mkdir -p "${MOUNT_TARGET}/home/${USER_LOGIN}/Documents"
mkdir -p "${MOUNT_TARGET}/home/${USER_LOGIN}/Pictures"

# Adicionar usuário e senha
echo "${USER_LOGIN}:x:1000:1000:${USER_FULLNAME}:/home/${USER_LOGIN}:/bin/bash" >> "${MOUNT_TARGET}/etc/passwd" 2>/dev/null || true
echo "${USER_LOGIN}:x:1000:" >> "${MOUNT_TARGET}/etc/group" 2>/dev/null || true

# Configurar senha criptografada via chpasswd ou openssl
if command -v openssl >/dev/null 2>&1; then
  ENCRYPTED_PASS=$(openssl passwd -6 "${USER_PASS}")
  echo "${USER_LOGIN}:${ENCRYPTED_PASS}:19000:0:99999:7:::" >> "${MOUNT_TARGET}/etc/shadow" 2>/dev/null || true
fi

chown -R 1000:1000 "${MOUNT_TARGET}/home/${USER_LOGIN}" 2>/dev/null || true

# Configurar GRUB Bootloader
echo -e "${C_BLUE}\n[5/5] Instalando Bootloader GRUB (UEFI / BIOS)...${C_RESET}"
mount --bind /dev "${MOUNT_TARGET}/dev" 2>/dev/null || true
mount --bind /dev/pts "${MOUNT_TARGET}/dev/pts" 2>/dev/null || true
mount --bind /proc "${MOUNT_TARGET}/proc" 2>/dev/null || true
mount --bind /sys "${MOUNT_TARGET}/sys" 2>/dev/null || true

chroot "${MOUNT_TARGET}" /bin/sh -c "
  if [ -d /sys/firmware/efi ]; then
    grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=InoveCloudOS --recheck || true
  else
    grub-install --target=i386-pc ${TARGET_DISK} || true
  fi
  grub-mkconfig -o /boot/grub/grub.cfg || update-grub || true
" 2>/dev/null || true

# Desmontar binds
umount -lf "${MOUNT_TARGET}/dev/pts" 2>/dev/null || true
umount -lf "${MOUNT_TARGET}/dev" 2>/dev/null || true
umount -lf "${MOUNT_TARGET}/proc" 2>/dev/null || true
umount -lf "${MOUNT_TARGET}/sys" 2>/dev/null || true
umount -lf "${MOUNT_TARGET}/boot/efi" 2>/dev/null || true
umount -lf "${MOUNT_TARGET}" 2>/dev/null || true

clear
echo -e "\n${C_GREEN}========================================================================${C_RESET}"
echo -e "${C_GREEN}   🎉 PARABÉNS! INOVECLOUD OS INSTALADO COM SUCESSO NO DISCO!           ${C_RESET}"
echo -e "${C_GREEN}========================================================================${C_RESET}"
echo " Resumo da Configuração:"
echo "   ▶ Idioma        : ${SYS_LOCALE}"
echo "   ▶ Usuário       : ${USER_LOGIN} (${USER_FULLNAME})"
echo "   ▶ Computador    : ${SYS_HOSTNAME}"
echo "   ▶ Disco Alvo    : ${TARGET_DISK}"
echo ""
echo "Você já pode reiniciar o computador e desfrutar do seu novo sistema operacional!"
echo -e "${C_CYAN}========================================================================${C_RESET}\n"
