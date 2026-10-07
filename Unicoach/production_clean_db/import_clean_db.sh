#!/bin/bash
# ==============================================================================
# UniCoach Production Database Import Script (CLEAN DATA ONLY)
# Imports strictly:
#  1. Universities (3,610 universities with full ranking, tuition, GPA, IELTS)
#  2. Countries (10 destination countries with relational ObjectIds)
#  3. Scholarships (135 verified scholarships with criteria & funding)
#  4. Users (Admin login account)
#
# NO DUMMY DATA: NO blogs, NO dummy leads, NO dummy social posts, NO test logs
# ==============================================================================

MONGO_URI=$1
BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -z "$MONGO_URI" ]; then
  echo "❌ Error: Target MONGO_URI required"
  echo "Usage: bash import_clean_db.sh \"mongodb://admin:password@host:27017/unicoach?authSource=admin\""
  exit 1
fi

echo "=========================================================="
echo "🚀 UNICOACH CLEAN PRODUCTION DATABASE SEEDING"
echo "=========================================================="
echo "Target MongoDB: $MONGO_URI"
echo "Data Directory: $BACKUP_DIR/unicoach"
echo ""

# 1. Install mongorestore if not present on Ubuntu/Debian
if ! command -v mongorestore &> /dev/null; then
  echo "📦 Installing MongoDB Database Tools..."
  wget -q https://fastdl.mongodb.org/tools/db/mongodb-database-tools-ubuntu2204-x86_64-100.10.0.tgz
  tar -xzf mongodb-database-tools-ubuntu2204-x86_64-100.10.0.tgz
  cp mongodb-database-tools-*/bin/* /usr/local/bin/
  rm -rf mongodb-database-tools*
  echo "✅ MongoDB Tools installed successfully"
fi

# 2. Import Countries FIRST (because Universities reference Countries via ObjectId)
echo ""
echo "📥 [1/4] Importing Destination Countries..."
mongorestore \
  --uri="$MONGO_URI" \
  --nsInclude="unicoach.countries" \
  --dir="$BACKUP_DIR" \
  --gzip \
  --drop

# 3. Import Universities (with full fields: GPA, IELTS, GRE, tuition, courses, degree levels)
echo ""
echo "📥 [2/4] Importing Universities (3,610 institutions)..."
mongorestore \
  --uri="$MONGO_URI" \
  --nsInclude="unicoach.universities" \
  --dir="$BACKUP_DIR" \
  --gzip \
  --drop

# 4. Import Scholarships (with eligibility criteria, deadliness, funding amount)
echo ""
echo "📥 [3/4] Importing Scholarships (135 verified awards)..."
mongorestore \
  --uri="$MONGO_URI" \
  --nsInclude="unicoach.scholarships" \
  --dir="$BACKUP_DIR" \
  --gzip \
  --drop

# 5. Import Users (Admin account)
echo ""
echo "📥 [4/4] Importing Users..."
mongorestore \
  --uri="$MONGO_URI" \
  --nsInclude="unicoach.users" \
  --dir="$BACKUP_DIR" \
  --gzip \
  --drop

echo ""
echo "=========================================================="
echo "🔍 VERIFYING PRODUCTION DATA INTEGRITY"
echo "=========================================================="

if command -v mongosh &> /dev/null; then
  mongosh "$MONGO_URI" --quiet --eval "
    const cCount = db.countries.countDocuments();
    const uCount = db.universities.countDocuments();
    const sCount = db.scholarships.countDocuments();
    const userCount = db.users.countDocuments();

    print('📊 Countries:    ' + cCount + ' (Expected: 10)');
    print('🏛️ Universities: ' + uCount + ' (Expected: 3610)');
    print('🎓 Scholarships: ' + sCount + ' (Expected: 135)');
    print('👤 Admin Users:  ' + userCount);

    // Test a sample matching query (like student shortlist)
    const testMatch = db.universities.findOne({
      tuitionFeeUSD: { \$lte: 40000 },
      minGpaPercent: { \$lte: 80 },
      minIeltsScore: { \$lte: 7.0 }
    });

    if (testMatch) {
      print('✅ Matching Engine Test: SUCCESS (Found: ' + testMatch.name + ', Ranking: ' + testMatch.rankingNum + ')');
    } else {
      print('⚠️ Warning: Matching query returned no results');
    }
  "
else
  echo "✅ Restore completed. (mongosh not found for direct query test)"
fi

echo ""
echo "🎉 Clean Production Database Ready! Zero dummy data present."
