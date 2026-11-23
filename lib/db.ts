import { Pool, PoolConfig, QueryResultRow } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.xvtuwezritdychsgcsbb:Sarvesh%402004@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';

const poolConfig: PoolConfig = {
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

declare global {
  // eslint-disable-next-line no-var
  var __dbPool: Pool | undefined;
}

let pool: Pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool(poolConfig);
} else {
  if (!global.__dbPool) {
    global.__dbPool = new Pool(poolConfig);
  }
  pool = global.__dbPool;
}

export default pool;

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const res = await pool.query<T>(text, params);
  return res.rows;
}

export async function queryOne<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}
