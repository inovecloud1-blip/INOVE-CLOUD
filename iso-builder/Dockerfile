# ==============================================================================
# InoveCloud OS Glass - Real Debian 12 Kiosk ISO Builder Dockerfile
# ==============================================================================
FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    debootstrap \
    debian-archive-keyring \
    squashfs-tools \
    xorriso \
    grub-pc-bin \
    grub-efi-amd64-bin \
    mtools \
    dosfstools \
    curl \
    wget \
    rsync \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . /app

RUN chmod +x iso-builder/build-iso.sh

CMD ["./iso-builder/build-iso.sh"]
