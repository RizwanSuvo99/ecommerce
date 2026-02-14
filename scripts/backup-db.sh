#!/usr/bin/env bash
#
# Database Backup Script for E-Commerce Platform
# Usage: ./scripts/backup-db.sh [options]
#
# Options:
#   -h, --help        Show this help message
#   -d, --dir DIR     Backup directory (default: ./backups)
#   -r, --retain NUM  Number of backups to retain (default: 30)
#   -c, --container   Container name (default: ecommerce-postgres)
#

set -euo pipefail

# Default configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
CONTAINER_NAME="${CONTAINER_NAME:-ecommerce-postgres}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-ecommerce}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILENAME="backup_${POSTGRES_DB}_${TIMESTAMP}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

show_help() {
    head -n 12 "$0" | tail -n 10
    exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help) show_help ;;
        -d|--dir) BACKUP_DIR="$2"; shift 2 ;;
        -r|--retain) RETENTION_DAYS="$2"; shift 2 ;;
        -c|--container) CONTAINER_NAME="$2"; shift 2 ;;
        *) log_error "Unknown option: $1"; exit 1 ;;
    esac
done

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

log_info "Starting database backup..."
log_info "Database: ${POSTGRES_DB}"
log_info "Backup directory: ${BACKUP_DIR}"

# Perform the backup using pg_dump
log_info "Running pg_dump..."

if command -v docker &> /dev/null; then
    # Docker-based backup
    docker exec "${CONTAINER_NAME}" pg_dump \
        -U "${POSTGRES_USER}" \
        -d "${POSTGRES_DB}" \
        --format=custom \
        --verbose \
        --no-owner \
        --no-privileges \
        2>/dev/null > "${BACKUP_DIR}/${BACKUP_FILENAME}.dump"
else
    # Direct pg_dump (when running outside Docker)
    pg_dump \
        -U "${POSTGRES_USER}" \
        -d "${POSTGRES_DB}" \
        --format=custom \
        --verbose \
        --no-owner \
        --no-privileges \
        > "${BACKUP_DIR}/${BACKUP_FILENAME}.dump" 2>/dev/null
fi

# Compress the backup
log_info "Compressing backup..."
gzip "${BACKUP_DIR}/${BACKUP_FILENAME}.dump"
BACKUP_FILE="${BACKUP_DIR}/${BACKUP_FILENAME}.dump.gz"

# Verify backup file exists and has content
if [[ -f "${BACKUP_FILE}" ]] && [[ -s "${BACKUP_FILE}" ]]; then
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    log_info "Backup completed successfully: ${BACKUP_FILE} (${BACKUP_SIZE})"
else
    log_error "Backup file is empty or was not created!"
    exit 1
fi

# Create a SHA256 checksum
sha256sum "${BACKUP_FILE}" > "${BACKUP_FILE}.sha256"
log_info "Checksum created: ${BACKUP_FILE}.sha256"

# Clean up old backups (retention policy)
log_info "Applying retention policy: keeping last ${RETENTION_DAYS} days of backups..."
DELETED_COUNT=0
while IFS= read -r old_backup; do
    rm -f "${old_backup}" "${old_backup}.sha256"
    DELETED_COUNT=$((DELETED_COUNT + 1))
    log_info "Deleted old backup: ${old_backup}"
done < <(find "${BACKUP_DIR}" -name "backup_${POSTGRES_DB}_*.dump.gz" -mtime "+${RETENTION_DAYS}" -type f 2>/dev/null)

if [[ ${DELETED_COUNT} -gt 0 ]]; then
    log_info "Cleaned up ${DELETED_COUNT} old backup(s)"
else
    log_info "No old backups to clean up"
fi

# Summary
TOTAL_BACKUPS=$(find "${BACKUP_DIR}" -name "backup_${POSTGRES_DB}_*.dump.gz" -type f | wc -l)
TOTAL_SIZE=$(du -sh "${BACKUP_DIR}" | cut -f1)
log_info "Backup summary:"
log_info "  Total backups: ${TOTAL_BACKUPS}"
log_info "  Total size: ${TOTAL_SIZE}"
log_info "  Latest backup: ${BACKUP_FILE}"

echo ""
log_info "Database backup completed successfully!"
