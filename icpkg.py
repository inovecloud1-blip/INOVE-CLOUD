#!/usr/bin/env python3
"""
==============================================================================
ICPKG - Gerenciador Oficial de Pacotes do InoveCloud OS
Formato de pacote: .tar.gz contendo metadados (manifest.json) e binários (/usr, /etc, /bin)
Banco de dados local: /var/log/icpkg/installed.json
==============================================================================
"""

import sys
import os
import json
import tarfile
import urllib.request
import shutil
import argparse
from datetime import datetime

DB_DIR = "/var/log/icpkg"
DB_FILE = os.path.join(DB_DIR, "installed.json")
REPO_URL = os.environ.get("ICPKG_REPO", "https://raw.githubusercontent.com/inovecloud/packages/main")

def init_db():
    if not os.path.exists(DB_DIR):
        os.makedirs(DB_DIR, exist_ok=True)
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump({}, f, indent=2)

def load_db():
    init_db()
    try:
        with open(DB_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def save_db(db):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2, ensure_ascii=False)

def check_root():
    if os.geteuid() != 0:
        print("[ERRO] icpkg necessita de privilégios de root (sudo icpkg ...)")
        sys.exit(1)

def install_package(pkg_name, custom_file=None):
    check_root()
    db = load_db()
    
    if pkg_name in db:
        print(f"[AVISO] O pacote '{pkg_name}' (versão {db[pkg_name].get('version', '1.0')}) já está instalado.")
        choice = input("Deseja reinstalar/atualizar? [s/N]: ").strip().lower()
        if choice != 's':
            return

    tmp_archive = f"/tmp/{pkg_name}.tar.gz"
    
    if custom_file:
        if not os.path.exists(custom_file):
            print(f"[ERRO] Arquivo de pacote local '{custom_file}' não encontrado.")
            sys.exit(1)
        shutil.copyfile(custom_file, tmp_archive)
    else:
        pkg_url = f"{REPO_URL}/{pkg_name}.tar.gz"
        print(f"[*] Baixando pacote '{pkg_name}' de {pkg_url}...")
        try:
            urllib.request.urlretrieve(pkg_url, tmp_archive)
        except Exception as e:
            print(f"[ERRO] Falha ao baixar pacote '{pkg_name}': {e}")
            sys.exit(1)

    print(f"[*] Extraindo e instalando arquivos de '{pkg_name}'...")
    installed_files = []
    manifest = {
        "name": pkg_name,
        "version": "1.0.0",
        "description": "Pacote InoveCloud OS",
        "installed_at": datetime.now().isoformat()
    }

    try:
        with tarfile.open(tmp_archive, "r:gz") as tar:
            # Verificar se há manifest.json dentro do pacote
            try:
                manifest_member = tar.getmember("manifest.json")
                manifest_file = tar.extractfile(manifest_member)
                if manifest_file:
                    manifest.update(json.loads(manifest_file.read().decode("utf-8")))
            except KeyError:
                pass

            # Extrair na raiz do sistema
            for member in tar.getmembers():
                if member.name == "manifest.json":
                    continue
                dest_path = os.path.join("/", member.name)
                tar.extract(member, path="/")
                installed_files.append(dest_path)

        manifest["files"] = installed_files
        db[pkg_name] = manifest
        save_db(db)
        print(f"[✓] Pacote '{pkg_name}' instalado com sucesso! ({len(installed_files)} arquivos extraídos)")
    except Exception as e:
        print(f"[ERRO] Falha ao descompactar pacote: {e}")
    finally:
        if os.path.exists(tmp_archive):
            os.remove(tmp_archive)

def remove_package(pkg_name):
    check_root()
    db = load_db()
    if pkg_name not in db:
        print(f"[ERRO] O pacote '{pkg_name}' não está instalado.")
        sys.exit(1)

    pkg_info = db[pkg_name]
    files = pkg_info.get("files", [])
    print(f"[*] Removendo pacote '{pkg_name}'...")

    for fpath in reversed(files):
        try:
            if os.path.isfile(fpath) or os.path.islink(fpath):
                os.remove(fpath)
            elif os.path.isdir(fpath) and not os.listdir(fpath):
                os.rmdir(fpath)
        except Exception as e:
            pass

    del db[pkg_name]
    save_db(db)
    print(f"[✓] Pacote '{pkg_name}' removido com sucesso.")

def list_packages():
    db = load_db()
    if not db:
        print("Nenhum pacote instalado via icpkg.")
        return
    print(f"{'PACOTE':<25} {'VERSÃO':<12} {'INSTALADO EM':<22} {'DESCRIÇÃO'}")
    print("=" * 75)
    for name, info in db.items():
        v = info.get("version", "1.0")
        dt = info.get("installed_at", "")[:19].replace("T", " ")
        desc = info.get("description", "")
        print(f"{name:<25} {v:<12} {dt:<22} {desc}")

def main():
    parser = argparse.ArgumentParser(description="icpkg - Gerenciador Nativo de Pacotes do InoveCloud OS")
    subparsers = parser.add_subparsers(dest="command")

    install_cmd = subparsers.add_parser("install", help="Instalar um pacote remoto ou arquivo local")
    install_cmd.add_argument("package", help="Nome do pacote ou caminho do arquivo .tar.gz")
    install_cmd.add_argument("-f", "--file", help="Caminho de arquivo local .tar.gz", default=None)

    remove_cmd = subparsers.add_parser("remove", help="Remover um pacote instalado")
    remove_cmd.add_argument("package", help="Nome do pacote a ser removido")

    subparsers.add_parser("list", help="Listar todos os pacotes instalados")

    args = parser.parse_args()

    if args.command == "install":
        if args.package.endswith(".tar.gz") and os.path.exists(args.package):
            pkg_name = os.path.basename(args.package).replace(".tar.gz", "")
            install_package(pkg_name, custom_file=args.package)
        else:
            install_package(args.package, custom_file=args.file)
    elif args.command == "remove":
        remove_package(args.package)
    elif args.command == "list":
        list_packages()
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
