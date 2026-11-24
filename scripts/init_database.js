const { Client } = require('pg');

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.xvtuwezritdychsgcsbb:Sarvesh%402004@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres";

// We extract data directly or require it
const ROLES = [
  {
    id: "creative-strategist",
    title: "Creative Strategist",
    dept: "Creative Team",
    type: "Full-time",
    exp_min: 2,
    exp_max: 4,
    pay: "₹65k–1L / month",
    status: "Open",
    problem: "Turn a vague ask into a sharp brief everyone can act on."
  },
  {
    id: "copywriter",
    title: "Copywriter, English + Hinglish",
    dept: "Creative Team",
    type: "Full-time",
    exp_min: 1,
    exp_max: 3,
    pay: "₹35k–60k / month",
    status: "Open",
    problem: "Write lines people repeat, not lines people scroll past."
  },
  {
    id: "brand-partnerships-manager",
    title: "Brand Partnerships Manager",
    dept: "Brand Partnerships",
    type: "Full-time",
    exp_min: 3,
    exp_max: 5,
    pay: "₹85k–1.25L / month",
    status: "Open",
    problem: "Start every conversation with the problem, not the pitch."
  },
  {
    id: "brand-solutions-executive",
    title: "Brand Solutions Executive",
    dept: "Brand Solutions",
    type: "Full-time",
    exp_min: 1,
    exp_max: 3,
    pay: "₹40k–65k / month",
    status: "Open",
    problem: "Turn a half-formed ask into a plan with dates and numbers on it."
  },
  {
    id: "ir-executive-south",
    title: "Influencer Relations Executive (South)",
    dept: "Influencer Relations",
    type: "Full-time",
    exp_min: 1,
    exp_max: 3,
    pay: "₹35k–50k / month",
    status: "Open",
    problem: "Build relationships with creators where both sides pick up on the second ring."
  },
  {
    id: "ir-intern",
    title: "Influencer Relations Intern",
    dept: "Influencer Relations",
    type: "Internship",
    exp_min: 0,
    exp_max: 1,
    pay: "₹15–20k / month",
    status: "Open",
    problem: "Find the 50 creators no other agency has emailed yet."
  },
  {
    id: "production-executive",
    title: "Production Executive, Studio",
    dept: "Production",
    type: "Full-time",
    exp_min: 2,
    exp_max: 4,
    pay: "₹35k–50k / month",
    status: "Open",
    problem: "Make shoot days feel so boringly well-run that everyone goes home on time."
  },
  {
    id: "video-editor",
    title: "Video Editor, Performance",
    dept: "Post-Production",
    type: "Full-time",
    exp_min: 2,
    exp_max: 4,
    pay: "₹40k–65k / month",
    status: "Open",
    problem: "Cut for the first three seconds without making the rest unwatchable."
  },
  {
    id: "hr-executive",
    title: "HR & Culture Executive",
    dept: "Human Resources",
    type: "Full-time",
    exp_min: 1,
    exp_max: 3,
    pay: "₹35k–50k / month",
    status: "Open",
    problem: "Hire people who love the work, not only the agency's name."
  },
  {
    id: "finance-executive",
    title: "Finance & Accounts Executive",
    dept: "Finance",
    type: "Full-time",
    exp_min: 2,
    exp_max: 4,
    pay: "₹40k–60k / month",
    status: "Open",
    problem: "Close books on the 4th, not the 24th."
  },
  {
    id: "talent-manager",
    title: "Talent Manager",
    dept: "Talent Management",
    type: "Full-time",
    exp_min: 2,
    exp_max: 4,
    pay: "₹50k–75k / month",
    status: "Open",
    problem: "Help an exclusive roster build careers that outlast any one algorithm shift."
  }
];

const APPLICANTS = [
  { id:"a01", name:"Ishita Rao", email:"ishita.rao@example.com", phone:"98200 41512", city:"Mumbai", mumbai:"Yes", role:"creative-strategist", stage:"Interview", daysAgo:12, total:3.5, rel:3, ctc:9, ectc:11.5, notice:"30 days", buyout:"Yes", lastco:"Brightloop Digital", lastdes:"Strategy Associate", langs:["English","Hindi","Kannada"], why:"I want a team that builds briefs backwards from data, not from a mood board.", admire:"A regional food creator who turned a recipe series into a sell-out spice brand. Specific audience, specific promise.", problem:"Pick a mid-size appliance brand. Problem: high reach, low branded search. I would brief Kannada and Tamil creators on one use case and track search lift, not views.", source:"LinkedIn" },
  { id:"a02", name:"Karthik Subramanian", email:"karthik.s@example.com", phone:"98400 22781", city:"Chennai", mumbai:"Yes", role:"ir-executive-south", stage:"Shortlisted", daysAgo:4, total:2, rel:2, ctc:4.2, ectc:5.5, notice:"15 days", buyout:"No", lastco:"Northstar Comms", lastdes:"Creator Partnerships Executive", langs:["English","Tamil","Telugu"], why:"I have built Tamil creator lists for two campaigns and want to do it with a team that measures cost per view, not likes.", admire:"A Tamil tech reviewer whose honest reviews drive sell-outs. Trust beats reach.", problem:"A fintech app with weak trust in Tier 2 Tamil Nadu. Use local creators who explain one feature in Tamil, and track installs by pin code.", source:"Instagram" },
  { id:"a03", name:"Sneha Kulkarni", email:"sneha.k@example.com", phone:"99300 18802", city:"Pune", mumbai:"Yes", role:"hr-executive", stage:"New", daysAgo:2, total:1.5, rel:1.5, ctc:3.8, ectc:5, notice:"30 days", buyout:"Yes", lastco:"Kettle & Co.", lastdes:"HR Associate", langs:["English","Hindi","Marathi"], why:"I ran hiring for a 40-person startup and cut our offer turnaround from 9 days to 3. I want to do that on a bigger funnel.", admire:"A hiring campaign where a brand let employees film their real day. Honest beats polished.", problem:"An edtech brand with poor trust after layoffs. Use teachers as creators to show real classrooms, and track demo bookings.", source:"Referral" },
  { id:"a04", name:"Rohan Desai", email:"rohan.desai@example.com", phone:"98190 55431", city:"Mumbai", mumbai:"Yes", role:"video-editor", stage:"Offer", daysAgo:21, total:4, rel:3.5, ctc:6.5, ectc:8, notice:"30 days", buyout:"Yes", lastco:"Sundial Studios", lastdes:"Editor", langs:["English","Hindi","Gujarati"], why:"I edit for retention. I want to work where someone actually reads the retention graph with me.", admire:"A mattress brand's 6-second cut that showed the product before the logo.", problem:"A D2C snack brand with good reach but weak repeat orders. Cut creator videos around one craving moment and test three hooks.", source:"LinkedIn" },
  { id:"a05", name:"Meera Iyer", email:"meera.iyer@example.com", phone:"90040 11237", city:"Bengaluru", mumbai:"No", role:"creative-strategist", stage:"New", daysAgo:1, total:5, rel:2, ctc:12, ectc:16, notice:"60 days", buyout:"No", lastco:"Pixelfarm Media", lastdes:"Senior Account Manager", langs:["English","Tamil","Malayalam"], why:"I want to move from servicing to strategy.", admire:"A bank's regional language campaign that explained FDs through family stories.", problem:"A healthcare chain with low awareness outside metros. Use doctors who create content in Malayalam and track appointment bookings.", source:"Naukri" },
  { id:"a06", name:"Zoya Shaikh", email:"zoya.shaikh@example.com", phone:"98330 90021", city:"Mumbai", mumbai:"Yes", role:"copywriter", stage:"Interview", daysAgo:9, total:2, rel:2, ctc:4.5, ectc:6, notice:"Immediate", buyout:"No", lastco:"Brightloop Digital", lastdes:"Copywriter", langs:["English","Hindi","Urdu"], why:"I write hooks in Hinglish that people quote back to me. I want to write them for brands that track saves.", admire:"A food delivery brand's push notifications. Ten words, one joke, one order.", problem:"A sunscreen brand people think is only for beaches. Script creators applying it before a Mumbai local train ride, and track repeat buys.", source:"Instagram" },
  { id:"a07", name:"Arjun Nair", email:"arjun.nair@example.com", phone:"97690 31144", city:"Mumbai", mumbai:"Yes", role:"brand-partnerships-manager", stage:"Shortlisted", daysAgo:6, total:6, rel:4, ctc:13, ectc:16, notice:"60 days", buyout:"Yes", lastco:"Northstar Comms", lastdes:"Sales Manager", langs:["English","Hindi","Malayalam"], why:"I have closed media deals on reach. I want to sell outcomes clients can audit.", admire:"An appliance brand that sold a fan on electricity savings, not looks.", problem:"A home loan company with high cost per lead. Use finance creators to explain one EMI myth, and track leads by city.", source:"LinkedIn" },
  { id:"a08", name:"Tanvi Joshi", email:"tanvi.joshi@example.com", phone:"98920 77610", city:"Thane", mumbai:"Yes", role:"production-executive", stage:"Hired", daysAgo:34, hiredAfter:24, total:2.5, rel:2.5, ctc:4, ectc:5.2, notice:"15 days", buyout:"No", lastco:"Sundial Studios", lastdes:"Production Coordinator", langs:["English","Hindi","Marathi"], why:"I like shoots that run on time. I want a studio that plans like an agency.", admire:"A one-take product demo shot in a real kitchen.", problem:"A cookware brand seen as expensive. Shoot real home cooks, one dish, one price-per-use line.", source:"Referral" },
  { id:"a09", name:"Vikram Reddy", email:"vikram.reddy@example.com", phone:"99890 40012", city:"Hyderabad", mumbai:"Yes", role:"ir-executive-south", stage:"New", daysAgo:3, total:1, rel:1, ctc:3.6, ectc:4.8, notice:"Immediate", buyout:"No", lastco:"Freelance", lastdes:"Creator Manager", langs:["English","Telugu","Hindi"], why:"I manage 12 Telugu creators today and want a team that pays them on time.", admire:"A Telugu comedy creator who made a bank ad people shared for the joke.", problem:"A two-wheeler EV brand with range anxiety in Andhra. Creators ride a real daily route on camera and share the battery left.", source:"Instagram" },
  { id:"a10", name:"Ananya Pillai", email:"ananya.pillai@example.com", phone:"98450 66320", city:"Kochi", mumbai:"Yes", role:"talent-manager", stage:"Rejected", rejAt:1, daysAgo:18, total:3, rel:1, ctc:6, ectc:9, notice:"30 days", buyout:"No", lastco:"Kettle & Co.", lastdes:"Marketing Executive", langs:["English","Malayalam"], why:"I love creators.", admire:"Many creators.", problem:"Any brand can grow with influencers.", source:"Other" },
  { id:"a11", name:"Siddharth Jain", email:"sid.jain@example.com", phone:"98210 13390", city:"Mumbai", mumbai:"Yes", role:"finance-executive", stage:"Interview", daysAgo:8, total:3, rel:3, ctc:5.5, ectc:6.8, notice:"30 days", buyout:"Yes", lastco:"Brightloop Digital", lastdes:"Accounts Executive", langs:["English","Hindi","Gujarati"], why:"I closed books in 4 days at my last agency. I want to make creator payments boringly reliable.", admire:"A brand that published its creator payment terms. Trust as a feature.", problem:"A creator platform with payment complaints. Fix the payout calendar before spending on ads.", source:"Naukri" },
  { id:"a12", name:"Fatima Ansari", email:"fatima.ansari@example.com", phone:"98670 22219", city:"Mumbai", mumbai:"Yes", role:"brand-solutions-executive", stage:"Hired", daysAgo:40, hiredAfter:19, total:2, rel:2, ctc:5, ectc:6.5, notice:"15 days", buyout:"No", lastco:"Pixelfarm Media", lastdes:"Client Servicing Executive", langs:["English","Hindi","Urdu"], why:"I like turning vague client asks into plans with dates on them.", admire:"A mattress brand's sleep-trial creator series. One promise, many proofs.", problem:"A water purifier brand losing to cheaper rivals. Show the cost of one illness against the filter price, through doctor creators.", source:"LinkedIn" },
  { id:"a13", name:"Nikhil Menon", email:"nikhil.menon@example.com", phone:"97020 55613", city:"Mumbai", mumbai:"Yes", role:"video-editor", stage:"Shortlisted", daysAgo:5, total:2.5, rel:2.5, ctc:5, ectc:6.5, notice:"15 days", buyout:"No", lastco:"Freelance", lastdes:"Video Editor", langs:["English","Hindi","Malayalam"], why:"I re-cut my own videos after reading retention graphs. Most editors don't look.", admire:"A phone brand's Shorts that open on the problem, not the phone.", problem:"An earphone brand seen as cheap. Cut creator videos around one sound moment and test three hooks.", source:"Instagram" },
  { id:"a14", name:"Divya Shetty", email:"divya.shetty@example.com", phone:"98860 42277", city:"Mangaluru", mumbai:"Yes", role:"ir-intern", stage:"New", daysAgo:0, total:0, rel:0, ctc:0, ectc:2.2, notice:"Immediate", buyout:"No", lastco:"College", lastdes:"Student", langs:["English","Kannada","Tulu","Hindi"], why:"I track why some Kannada creators blow up and others don't. I want to learn the business side.", admire:"A Kannada creator who reviews street food with prices on screen.", problem:"A local coffee brand unknown outside Karnataka. Creators do a 7-day filter coffee switch and show the cost per cup.", source:"College" },
  { id:"a15", name:"Harsh Vora", email:"harsh.vora@example.com", phone:"99200 31876", city:"Ahmedabad", mumbai:"No", role:"copywriter", stage:"Rejected", rejAt:0, daysAgo:15, total:1, rel:0.5, ctc:3, ectc:5, notice:"30 days", buyout:"No", lastco:"Freelance", lastdes:"Content Writer", langs:["English","Gujarati"], why:"Looking for a change.", admire:"Not sure.", problem:"Use more influencers.", source:"Naukri" },
  { id:"a16", name:"Pooja Naik", email:"pooja.naik@example.com", phone:"98330 64410", city:"Mumbai", mumbai:"Yes", role:"hr-executive", stage:"Shortlisted", daysAgo:6, total:2, rel:2, ctc:4.2, ectc:5.4, notice:"30 days", buyout:"Yes", lastco:"Northstar Comms", lastdes:"Talent Acquisition Executive", langs:["English","Hindi","Marathi","Konkani"], why:"I have hired 40 people in a year. I want to fix the funnel, not only fill it.", admire:"A company that sent rejected candidates real feedback. People remembered.", problem:"A gym chain with high trial drop-off. Members film week 1 honestly and the brand tracks week-4 retention.", source:"LinkedIn" }
];

async function initDatabase() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Connecting to Supabase PostgreSQL database...");
    await client.connect();
    console.log("Connected successfully.\n");

    // 1. Create Roles Table
    console.log("Creating table: roles...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        dept VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        exp_min INT NOT NULL DEFAULT 0,
        exp_max INT NOT NULL DEFAULT 10,
        pay VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Open',
        problem TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create Applicants Table
    console.log("Creating table: applicants...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS applicants (
        id VARCHAR(64) PRIMARY KEY,
        ref VARCHAR(32) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        age INT,
        gender VARCHAR(50),
        city VARCHAR(100) NOT NULL,
        mumbai VARCHAR(10) NOT NULL DEFAULT 'Yes',
        role VARCHAR(100) NOT NULL,
        dept VARCHAR(100),
        stage VARCHAR(50) NOT NULL DEFAULT 'New',
        applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        total NUMERIC(5,2) DEFAULT 0,
        rel NUMERIC(5,2) DEFAULT 0,
        ctc NUMERIC(10,2) DEFAULT 0,
        ectc NUMERIC(10,2) DEFAULT 0,
        notice VARCHAR(50) DEFAULT '30 days',
        buyout VARCHAR(10) DEFAULT 'No',
        joining VARCHAR(50),
        negotiable VARCHAR(10),
        lastco VARCHAR(255),
        lastdes VARCHAR(255),
        langs TEXT[] DEFAULT '{}',
        resume_url TEXT,
        resume_name VARCHAR(255),
        portfolio TEXT,
        linkedin TEXT,
        instagram VARCHAR(255),
        why TEXT,
        admire TEXT,
        problem TEXT,
        source VARCHAR(100),
        referral VARCHAR(255),
        consent BOOLEAN DEFAULT TRUE,
        score JSONB DEFAULT '{}',
        notes JSONB DEFAULT '[]',
        ai_summary TEXT,
        ai_rationale TEXT,
        custom JSONB DEFAULT '{}',
        rej_at INT,
        hired_at TIMESTAMPTZ,
        hired_after INT,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Create Settings & Counters Table
    console.log("Creating table: app_settings...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key VARCHAR(100) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Create Indexes
    console.log("Creating indexes on applicants table...");
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_applicants_role ON applicants(role);
      CREATE INDEX IF NOT EXISTS idx_applicants_stage ON applicants(stage);
      CREATE INDEX IF NOT EXISTS idx_applicants_dept ON applicants(dept);
      CREATE INDEX IF NOT EXISTS idx_applicants_applied_at ON applicants(applied_at DESC);
      CREATE INDEX IF NOT EXISTS idx_applicants_email ON applicants(email);
    `);

    // 5. Seed Roles
    console.log("\nSeeding 11 open roles...");
    for (const r of ROLES) {
      await client.query(`
        INSERT INTO roles (id, title, dept, type, exp_min, exp_max, pay, status, problem)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          dept = EXCLUDED.dept,
          type = EXCLUDED.type,
          exp_min = EXCLUDED.exp_min,
          exp_max = EXCLUDED.exp_max,
          pay = EXCLUDED.pay,
          status = EXCLUDED.status,
          problem = EXCLUDED.problem;
      `, [r.id, r.title, r.dept, r.type, r.exp_min, r.exp_max, r.pay, r.status, r.problem]);
    }
    console.log("Roles seeded successfully.");

    // Helper map role to dept
    const roleDeptMap = {};
    ROLES.forEach(r => { roleDeptMap[r.id] = r.dept; });

    // 6. Seed Initial Applicants
    console.log(`\nSeeding ${APPLICANTS.length} initial applicants...`);
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");

    let num = 1;
    for (const a of APPLICANTS) {
      const ref = `TBM-${yy}${mm}-${String(num).padStart(4, "0")}`;
      num++;

      const appliedDate = new Date(Date.now() - (a.daysAgo || 0) * 86400000);
      const dept = roleDeptMap[a.role] || "Creative Team";

      const defaultScore = {
        Craft: Math.min(4, Math.max(2, Math.round(a.rel || 2))),
        Thinking: 3,
        Culture: 3,
        Speed: 3
      };

      const initialNotes = [
        {
          text: `Application received via ${a.source || "Website"}.`,
          by: "System",
          at: appliedDate.toISOString()
        }
      ];

      if (a.stage !== "New") {
        initialNotes.push({
          text: `Moved to ${a.stage}.`,
          by: "Sarvesh (HR Lead)",
          at: new Date(appliedDate.getTime() + 86400000).toISOString()
        });
      }

      await client.query(`
        INSERT INTO applicants (
          id, ref, name, email, phone, city, mumbai, role, dept, stage,
          applied_at, total, rel, ctc, ectc, notice, buyout,
          lastco, lastdes, langs, why, admire, problem, source,
          score, notes, rej_at, hired_after
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17,
          $18, $19, $20, $21, $22, $23, $24,
          $25, $26, $27, $28
        )
        ON CONFLICT (id) DO UPDATE SET
          ref = EXCLUDED.ref,
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          stage = EXCLUDED.stage,
          ctc = EXCLUDED.ctc,
          ectc = EXCLUDED.ectc;
      `, [
        a.id,
        ref,
        a.name,
        a.email,
        a.phone,
        a.city,
        a.mumbai,
        a.role,
        dept,
        a.stage,
        appliedDate.toISOString(),
        a.total,
        a.rel,
        a.ctc,
        a.ectc,
        a.notice,
        a.buyout,
        a.lastco || null,
        a.lastdes || null,
        a.langs || [],
        a.why,
        a.admire || null,
        a.problem,
        a.source || "Website",
        JSON.stringify(defaultScore),
        JSON.stringify(initialNotes),
        a.rejAt || null,
        a.hiredAfter || null
      ]);
    }
    console.log("Applicants seeded successfully.");

    // 7. Seed Sequence Counter in app_settings
    console.log("\nConfiguring application sequence counter in app_settings...");
    await client.query(`
      INSERT INTO app_settings (key, value)
      VALUES ('applicant_seq', $1)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
    `, [JSON.stringify({ seq: 41, updated_at: new Date().toISOString() })]);

    // 8. Verification queries
    console.log("\n=== DATABASE CONFIGURATION VERIFICATION ===");
    const rolesCount = await client.query("SELECT COUNT(*) FROM roles;");
    const appsCount = await client.query("SELECT COUNT(*) FROM applicants;");
    const stagesBreakdown = await client.query(`
      SELECT stage, COUNT(*) as count 
      FROM applicants 
      GROUP BY stage 
      ORDER BY count DESC;
    `);

    console.log(`Total Roles in DB: ${rolesCount.rows[0].count}`);
    console.log(`Total Applicants in DB: ${appsCount.rows[0].count}`);
    console.log("Applicants by Stage:", stagesBreakdown.rows);

    const sample = await client.query(`
      SELECT id, ref, name, role, dept, stage, ctc, ectc, applied_at 
      FROM applicants 
      LIMIT 3;
    `);
    console.log("\nSample Stored Applicants:", sample.rows);

  } catch (err) {
    console.error("Database configuration error:", err);
  } finally {
    await client.end();
    console.log("\nDatabase connection closed.");
  }
}

initDatabase();
