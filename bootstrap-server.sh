#!/usr/bin/env bash
#
# bootstrap-server.sh
#
# Richtet einen frischen Ubuntu-Server für Docker-basiertes Hosting ein:
# - System-Updates + automatische Sicherheitspatches
# - Docker + Docker Compose Plugin
# - Deploy-User (statt als root zu arbeiten)
# - UFW Firewall + fail2ban
# - SSH-Hardening (kein Root-Login, kein Passwort-Login)
# - Optional: Cloudflare Tunnel (cloudflared)
# - Optional: Klonen eines Infra-Git-Repos mit den docker-compose Stacks
#
# Vorher unbedingt einmal in einer Test-VM durchlaufen lassen und die
# Variablen unten anpassen!
#
# Nutzung:  sudo ./bootstrap-server.sh

set -euo pipefail

# ============================================================
#  KONFIGURATION – bitte vor dem Ausführen anpassen
# ============================================================
SSH_PORT="22"                        # ggf. auf einen anderen Port ändern
STACKS_DIR="/opt/stacks"             # docker-compose Stacks liegen hier
DATA_DIR="/opt/data"                 # persistente Volume-Daten liegen hier

OPEN_HTTP_HTTPS_PORTS=false          # true, falls KEIN Cloudflare Tunnel genutzt wird
                                      # und Traefik/Caddy direkt Port 80/443 braucht

# ============================================================

log() { echo -e "\n\033[1;32m==> $1\033[0m"; }
warn() { echo -e "\n\033[1;33m!! $1\033[0m"; }

if [ "$EUID" -ne 0 ]; then
  echo "Bitte als root bzw. mit sudo ausführen." >&2
  exit 1
fi

# ---- 1. System aktualisieren ----
log "System aktualisieren"
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

# ---- 2. Basis-Pakete ----
log "Basis-Pakete installieren"
apt-get install -y \
  ca-certificates curl gnupg lsb-release git ufw fail2ban \
  unattended-upgrades rsync apt-transport-https software-properties-common

# ---- 3. Automatische Sicherheitsupdates ----
log "Automatische Sicherheitsupdates aktivieren"
dpkg-reconfigure -f noninteractive unattended-upgrades
systemctl enable --now unattended-upgrades

# ---- 5. Docker installieren ----
log "Docker installieren"
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

# shellcheck disable=SC1091
. /etc/os-release
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable --now docker

# ---- 6. Firewall ----
log "Firewall (UFW) konfigurieren"
ufw default deny incoming
ufw default allow outgoing
ufw allow "${SSH_PORT}/tcp"

if [ "$OPEN_HTTP_HTTPS_PORTS" = true ]; then
  ufw allow 80/tcp
  ufw allow 443/tcp
else
  log "Port 80/443 bleiben zu (Cloudflare Tunnel macht keine eingehenden Ports nötig)"
fi

ufw --force enable

# ---- 7. SSH-Hardening ----
log "SSH absichern"
SSHD_CONFIG="/etc/ssh/sshd_config"
cp "$SSHD_CONFIG" "${SSHD_CONFIG}.bak.$(date +%s)"

sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' "$SSHD_CONFIG"
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' "$SSHD_CONFIG"
sed -i "s/^#\?Port .*/Port ${SSH_PORT}/" "$SSHD_CONFIG"

warn "SSH wird neu gestartet. Stelle sicher, dass dein Public Key bereits in authorized_keys steht,"
warn "bevor du dich ausloggst, sonst sperrst du dich aus!"
systemctl restart ssh

# ---- 8. fail2ban ----
log "fail2ban aktivieren"
systemctl enable --now fail2ban

log "Fertig!"
echo "Nächste Schritte:"
echo "  1. Secrets (.env-Dateien) manuell/aus dem Passwort-Manager einspielen"
echo "  2. In $STACKS_DIR/<app>/ jeweils: docker compose up -d"
