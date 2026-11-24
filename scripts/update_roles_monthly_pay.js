const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.xvtuwezritdychsgcsbb:Sarvesh%402004@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const ROLES_MONTHLY = [
  { id: 'creative-strategist', pay: '₹65k–1L / month' },
  { id: 'copywriter', pay: '₹35k–60k / month' },
  { id: 'brand-partnerships-manager', pay: '₹85k–1.25L / month' },
  { id: 'brand-solutions-executive', pay: '₹40k–65k / month' },
  { id: 'ir-executive-south', pay: '₹35k–50k / month' },
  { id: 'ir-intern', pay: '₹15–20k / month' },
  { id: 'production-executive', pay: '₹35k–50k / month' },
  { id: 'video-editor', pay: '₹40k–65k / month' },
  { id: 'hr-executive', pay: '₹35k–50k / month' },
  { id: 'finance-executive', pay: '₹40k–60k / month' },
  { id: 'talent-manager', pay: '₹50k–75k / month' },
];

async function updateDb() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const r of ROLES_MONTHLY) {
      await client.query('UPDATE roles SET pay = $1 WHERE id = $2', [r.pay, r.id]);
    }

    // Drop existing view and recreate with new column names
    await client.query(`DROP VIEW IF EXISTS google_sheets_sync_view CASCADE;`);
    await client.query(`
      CREATE VIEW google_sheets_sync_view AS
      SELECT 
        a.ref AS "Reference ID",
        to_char(a.applied_at AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD HH24:MI:SS') AS "Applied At (IST)",
        a.name AS "Full Name",
        a.email AS "Email Address",
        a.phone AS "Phone / WhatsApp",
        a.city AS "Current City",
        a.mumbai AS "Open to Mumbai Office",
        COALESCE(a.dept, r.dept, 'General') AS "Department",
        COALESCE(a.role_title, r.title, a.role) AS "Role Title",
        a.stage AS "Current Hiring Stage",
        a.notice AS "Notice Period",
        a.joining AS "Earliest Joining Date",
        a.buyout AS "Buyout Possible",
        a.total AS "Total Experience (Years)",
        a.rel AS "Relevant Experience (Years)",
        a.ctc AS "Current Monthly Pay (₹)",
        a.ectc AS "Expected Monthly Pay (₹)",
        a.negotiable AS "Pay Negotiable",
        a.lastco AS "Last Company",
        a.lastdes AS "Last Designation",
        array_to_string(a.langs, ', ') AS "Languages",
        COALESCE(a.resume_name, 'No file') AS "Resume File Name",
        COALESCE(a.resume_url, '') AS "Resume File URL",
        COALESCE(a.portfolio, '') AS "Portfolio URL",
        COALESCE(a.linkedin, '') AS "LinkedIn URL",
        COALESCE(a.instagram, '') AS "Instagram Handle",
        a.why AS "Why TBM",
        a.admire AS "Admired Creator / Campaign",
        a.problem AS "Brand Problem Solution",
        a.source AS "Source",
        COALESCE(a.referral, '') AS "Referred By",
        COALESCE((a.score->>'Craft')::numeric, 0) AS "Craft Rating (1-4)",
        COALESCE((a.score->>'Thinking')::numeric, 0) AS "Thinking Rating (1-4)",
        COALESCE((a.score->>'Culture')::numeric, 0) AS "Culture Rating (1-4)",
        COALESCE((a.score->>'Speed')::numeric, 0) AS "Speed Rating (1-4)",
        COALESCE(
          (SELECT n->>'text' FROM jsonb_array_elements(a.notes) n ORDER BY n->>'at' DESC LIMIT 1),
          'No notes yet'
        ) AS "Latest Note",
        to_char(a.updated_at AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD HH24:MI:SS') AS "Last Updated (IST)"
      FROM applicants a
      LEFT JOIN roles r ON a.role = r.id
      ORDER BY a.applied_at DESC;
    `);

    await client.query('COMMIT');
    console.log('Database successfully updated with monthly pay for all 11 roles and view recreated.');

    const check = await client.query('SELECT id, title, pay FROM roles ORDER BY id ASC');
    console.log('Current roles in DB:', check.rows);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating DB:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

updateDb();
