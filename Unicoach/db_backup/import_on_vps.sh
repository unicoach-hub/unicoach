#!/bin/bash
# ============================================================
# UniCoach DB Migration Script
# Run on VPS after Coolify MongoDB is deployed
# Usage: bash import_db.sh <MONGO_URI>
# Example: bash import_db.sh "mongodb://admin:pass@localhost:27017/unicoach"
# ============================================================

MONGO_URI=$1
BACKUP_DIR="/tmp/unicoach_backup"

if [ -z "$MONGO_URI" ]; then
  echo "❌ Error: MONGO_URI required"
  echo "Usage: bash import_db.sh \"mongodb://admin:password@host:27017/unicoach\""
  exit 1
fi

echo "🚀 UniCoach DB Import Starting..."
echo "Target: $MONGO_URI"
echo ""

# Install mongorestore if not present
if ! command -v mongorestore &> /dev/null; then
  echo "📦 Installing MongoDB Tools..."
  wget -q https://fastdl.mongodb.org/tools/db/mongodb-database-tools-ubuntu2204-x86_64-100.10.0.tgz
  tar -xzf mongodb-database-tools-ubuntu2204-x86_64-100.10.0.tgz
  cp mongodb-database-tools-*/bin/* /usr/local/bin/
  echo "✅ MongoDB Tools installed"
fi

# Extract backup
echo "📂 Extracting backup..."
tar -xzf /tmp/unicoach_backup.tar.gz -C /tmp/

# Restore all collections
echo "📥 Importing data into VPS MongoDB..."
mongorestore \
  --uri="$MONGO_URI" \
  --dir="$BACKUP_DIR/unicoach" \
  --db="unicoach" \
  --gzip \
  --drop \
  --verbose

echo ""
echo "✅ Import Complete! Verifying..."

# Quick verify
mongosh "$MONGO_URI" --eval "
  const cols = db.getCollectionNames();
  print('Collections imported: ' + cols.length);
  print('Universities: ' + db.universities.countDocuments());
  print('Scholarships: ' + db.scholarships.countDocuments());
  print('Users: ' + db.users.countDocuments());
" 2>/dev/null || echo "Run 'mongosh' manually to verify"
