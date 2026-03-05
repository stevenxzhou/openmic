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
    bigIntAsNumber: true,
});

export async function query(sql: string, params?: any[]) {
    const connection = await pool.getConnection();
    try {
        const rows = await connection.query(sql, params);
        return convertBigIntToNumber(rows);
    } finally {
        connection.release();
    }
}

// Helper function to convert BigInt to Number
function convertBigIntToNumber(obj: any): any {
    if (typeof obj === 'bigint') {
        return Number(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map(convertBigIntToNumber);
    }
    if (obj && typeof obj === 'object') {
        const converted: any = {};
        for (const key in obj) {
            converted[key] = convertBigIntToNumber(obj[key]);
        }
        return converted;
    }
    return obj;
}

// Events
export async function getEvents() {
    return query('SELECT * FROM events ORDER BY start_date DESC');
}

export async function getEventById(eventId: number) {
    const result = await query('SELECT * FROM events WHERE event_id = ?', [eventId]);
    return result?.[0] || null;
}

export async function createEvent(eventData: any) {
    const { title, description, start_date, end_date, location } = eventData;
    const result = await query(
        'INSERT INTO events (title, description, start_date, end_date, location) VALUES (?, ?, ?, ?, ?)',
        [title, description, start_date, end_date, location]
    );
    return { event_id: Number(result.insertId), ...eventData };
}

// Performances
export async function getPerformancesByEventId(eventId: number) {
    return query(`
        SELECT p.*, u.email, u.first_name, u.last_name 
        FROM performances p
        LEFT JOIN users u ON p.user_id = u.user_id
        WHERE p.event_id = ?
        ORDER BY p.performance_index ASC
    `, [eventId]);
}

export async function getPerformanceById(performanceId: number) {
    const result = await query(`
        SELECT p.*, u.email, u.first_name, u.last_name 
        FROM performances p
        LEFT JOIN users u ON p.user_id = u.user_id
        WHERE p.performance_id = ?
    `, [performanceId]);
    return result?.[0] || null;
}

export async function createPerformance(performanceData: any) {
    const { event_id, user_id, songs, status, performance_index, first_name, last_name, email } = performanceData;
    
    // If user_id is not provided but we have user details, create a guest user
    let finalUserId = user_id;
    if (!finalUserId && (first_name || email)) {
        // Create or find guest user
        const guestEmail = email || `guest_${Date.now()}@openmic.local`;
        let guestUser = await getUserByEmail(guestEmail);
        
        if (!guestUser) {
            guestUser = await createUser({
                email: guestEmail,
                password: 'guest',
                first_name: first_name || 'Guest',
                last_name: last_name || ''
            });
        }
        finalUserId = guestUser.user_id || guestUser.id;
    }
    
    const result = await query(
        'INSERT INTO performances (event_id, user_id, songs, status, performance_index) VALUES (?, ?, ?, ?, ?)',
        [event_id, finalUserId, JSON.stringify(songs), status || 'PENDING', performance_index || 0]
    );
    return { performance_id: Number(result.insertId), ...performanceData };
}

export async function updatePerformance(performanceId: number, updateData: any) {
    const { status, performance_index } = updateData;
    await query(
        'UPDATE performances SET status = ?, performance_index = ? WHERE performance_id = ?',
        [status, performance_index, performanceId]
    );
    return getPerformanceById(performanceId);
}

export async function deletePerformance(performanceId: number) {
    await query('DELETE FROM performances WHERE performance_id = ?', [performanceId]);
}

// Users
export async function getUserByEmail(email: string) {
    const result = await query('SELECT * FROM users WHERE email = ?', [email]);
    return result?.[0] || null;
}

export async function getUserById(userId: number) {
    const result = await query('SELECT * FROM users WHERE user_id = ?', [userId]);
    return result?.[0] || null;
}

export async function createUser(userData: any) {
    const { email, password, first_name, last_name } = userData;
    const result = await query(
        'INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)',
        [email, password, first_name || '', last_name || '']
    );
    return { user_id: Number(result.insertId), email, first_name, last_name };
}