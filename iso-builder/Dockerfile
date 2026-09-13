# ==============================================================================
# InoveCloud OS - Debian 13 (Trixie) GNOME Glass ISO Builder Container
# Runs inside Docker on Linux, Mac, Windows, or GitHub Actions
# ==============================================================================
FROM debian:trixie-slim

ENV DEBIAN_FRONTEND=noninteractive

# Install all ISO mastering tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    debootstrap \
    debian-archive-keyring \
    squashfs-tools \
    xorriso \
    isolinux \
    syslinux-efi \
    grub-pc-bin \
    grub-efi-amd64-bin \
    mtools \
    curl \
    ca-certificates \
    git \
    rsync \
    dosfstools \
    udev \
    kmod \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Copy build script and assets into container
COPY build-iso.sh /workspace/build-iso.sh
RUN chmod +x /workspace/build-iso.sh

# Volume to extract the generated ISO
VOLUME ["/output"]

CMD ["/bin/bash", "-c", "./build-iso.sh && cp dist-iso/*.iso* /output/"]
