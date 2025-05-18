import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

const pool: mariadb.Pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
});

export async function query(sql: string, params?: any[]) {
    const connection = await pool.getConnection();
    try {
        const rows = await connection.query(sql, params);
        return rows;
    } finally {
        connection.release();
    }
}