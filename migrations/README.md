# Database Migrations

This folder contains SQL migration scripts for updating the database schema and data.

## Available Migrations

### 1. `create_eligible_offers_view.sql`
Creates the `vw_student_eligible_offers` view that filters job offers based on student eligibility criteria (CGPA, backlogs, branch).

**Usage:**
```bash
mysql -u root -p placement_db < migrations/create_eligible_offers_view.sql
```

### 2. `update_placement_statuses_with_offers.sql`
Updates `placement_statuses` table to link students with their final job offers.

**Sample data included:**
- Student 1 (Riya Sharma): Placed at Software Engineer Intern (₹60,000)
- Student 5 (Ishita Sen): Placed at Cloud Associate Program (₹50,000)

**Usage:**
```bash
mysql -u root -p placement_db < migrations/update_placement_statuses_with_offers.sql
```

Or via Node.js:
```bash
node -e "const db = require('./db'); const fs = require('fs'); const sql = fs.readFileSync('migrations/update_placement_statuses_with_offers.sql', 'utf8').split(';').filter(q => q.trim() && !q.trim().startsWith('--')); sql.forEach(q => { if(q.trim()) db.query(q, (err) => { if(err) console.error(err); }); });"
```

## Running All Migrations

To apply all migrations in sequence:
```bash
# Create view first
mysql -u root -p placement_db < migrations/create_eligible_offers_view.sql

# Add sample placement data
mysql -u root -p placement_db < migrations/update_placement_statuses_with_offers.sql
```

## Notes

- All migrations are idempotent where possible (using `CREATE OR REPLACE VIEW`, `INSERT IGNORE`, etc.)
- Always backup your database before running migrations
- Migrations are designed to work with the schema defined in `schema.sql`
