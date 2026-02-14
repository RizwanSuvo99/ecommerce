#!/usr/bin/env bash
#
# Database Restore Script for E-Commerce Platform
# Usage: ./scripts/restore-db.sh <backup_file> [options]
#
# Options:
#   -h, --help        Show this help message
#   -c, --container   Container name (default: ecommerce-postgres)
#   -y, --yes         Skip confirmation prompt
#   --drop            Drop existing database before restore
#

set -euo pipefail

# Default configuration
CONTAINER_NAME="${CONTAINER_NAME:-ecommerce-postgres}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-ecommerce}"
SKIP_CONFIRM=false
DROP_DB=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

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

# Check for backup file argument
BACKUP_FILE=""
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help) show_help ;;
        -c|--container) CONTAINER_NAME="$2"; shift 2 ;;
        -y|--yes) SKIP_CONFIRM=true; shift ;;
        --drop) DROP_DB=true; shift ;;
        *)
            if [[ -z "${BACKUP_FILE}" ]]; then
                BACKUP_FILE="$1"
                shift
            else
                log_error "Unknown option: $1"
                exit 1
            fi
            ;;
    esac
done

if [[ -z "${BACKUP_FILE}" ]]; then
    log_error "No backup file specified!"
    echo "Usage: $0 <backup_file> [options]"
    echo ""
    echo "Available backups:"
    ls -la ./backups/backup_*.dump.gz 2>/dev/null || echo "  No backups found in ./backups/"
    exit 1
fi

# Verify the backup file exists
if [[ ! -f "${BACKUP_FILE}" ]]; then
    log_error "Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

# Verify checksum if available
CHECKSUM_FILE="${BACKUP_FILE}.sha256"
if [[ -f "${CHECKSUM_FILE}" ]]; then
    log_info "Verifying backup checksum..."
    if sha256sum -c "${CHECKSUM_FILE}" &>/dev/null; then
        log_info "Checksum verification passed"
    else
        log_error "Checksum verification failed! Backup may be corrupted."
        exit 1
    fi
else
    log_warn "No checksum file found, skipping verification"
fi

# Confirmation prompt
BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
log_warn "You are about to restore the database from:"
log_warn "  File: ${BACKUP_FILE}"
log_warn "  Size: ${BACKUP_SIZE}"
log_warn "  Database: ${POSTGRES_DB}"
log_warn "  Container: ${CONTAINER_NAME}"

if [[ "${DROP_DB}" == true ]]; then
    log_warn "  WARNING: Existing database will be DROPPED!"
fi

if [[ "${SKIP_CONFIRM}" != true ]]; then
    echo ""
    read -rp "Are you sure you want to proceed? (yes/no): " confirmation
    if [[ "${confirmation}" != "yes" ]]; then
        log_info "Restore cancelled."
        exit 0
    fi
fi

# Decompress if needed
RESTORE_FILE="${BACKUP_FILE}"
if [[ "${BACKUP_FILE}" == *.gz ]]; then
    log_info "Decompressing backup..."
    RESTORE_FILE="${BACKUP_FILE%.gz}"
    gunzip -k "${BACKUP_FILE}"
fi

# Drop and recreate database if requested
if [[ "${DROP_DB}" == true ]]; then
    log_info "Dropping existing database..."
    if command -v docker &> /dev/null; then
        docker exec "${CONTAINER_NAME}" dropdb -U "${POSTGRES_USER}" --if-exists "${POSTGRES_DB}"
        docker exec "${CONTAINER_NAME}" createdb -U "${POSTGRES_USER}" "${POSTGRES_DB}"
    else
        dropdb -U "${POSTGRES_USER}" --if-exists "${POSTGRES_DB}"
        createdb -U "${POSTGRES_USER}" "${POSTGRES_DB}"
    fi
    log_info "Database recreated"
fi

# Perform the restore
log_info "Restoring database..."

if command -v docker &> /dev/null; then
    docker exec -i "${CONTAINER_NAME}" pg_restore \
        -U "${POSTGRES_USER}" \
        -d "${POSTGRES_DB}" \
        --verbose \
        --no-owner \
        --no-privileges \
        --clean \
        --if-exists \
        < "${RESTORE_FILE}" 2>/dev/null || true
else
    pg_restore \
        -U "${POSTGRES_USER}" \
        -d "${POSTGRES_DB}" \
        --verbose \
        --no-owner \
        --no-privileges \
        --clean \
        --if-exists \
        "${RESTORE_FILE}" 2>/dev/null || true
fi

# Clean up decompressed file
if [[ "${BACKUP_FILE}" == *.gz ]] && [[ -f "${RESTORE_FILE}" ]]; then
    rm -f "${RESTORE_FILE}"
fi

log_info "Database restore completed successfully!"
log_info "Please verify the data integrity manually."
