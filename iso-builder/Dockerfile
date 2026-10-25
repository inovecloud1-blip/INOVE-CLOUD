# ==============================================================================
# InoveCloud OS - Pure Linux Kernel 7.3 RT LFS Standalone ISO Builder Dockerfile
# Zero Debian • Zero GNOME • Ring 0 DRM/KMS Framebuffer • ~1.5 GB ISO
# ==============================================================================
FROM ubuntu:24.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    bison \
    flex \
    libelf-dev \
    libssl-dev \
    bc \
    squashfs-tools \
    xorriso \
    grub-pc-bin \
    grub-efi-amd64-bin \
    mtools \
    dosfstools \
    curl \
    wget \
    tar \
    xz-utils \
    cpio \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . /app

RUN chmod +x iso-builder/build-iso.sh build-inovecloud.sh

CMD ["./iso-builder/build-iso.sh"]
