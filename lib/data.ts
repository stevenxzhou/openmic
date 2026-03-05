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
        SELECT * FROM performances
        WHERE event_id = ?
        ORDER BY performance_index ASC
    `, [eventId]);
}

export async function getPerformanceById(performanceId: number) {
    const result = await query(`
        SELECT * FROM performances
        WHERE performance_id = ?
    `, [performanceId]);
    return result?.[0] || null;
}

export async function createPerformance(performanceData: any) {
    const { event_id, songs, status, performance_index, performers, inputs, social_medias } = performanceData;
    
    // social_medias is now stored as a plain string (Instagram handle)
    const socialMediasValue = social_medias || '';
    
    const result = await query(
        'INSERT INTO performances (event_id, performance_index, songs, status, performers, inputs, social_medias, likes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [event_id, performance_index || 0, JSON.stringify(songs), status || 'PENDING', performers || '', inputs || '', socialMediasValue, 0]
    );
    return { performance_id: Number(result.insertId), ...performanceData, likes: 0 };
}

export async function updatePerformance(performanceId: number, updateData: any) {
    const { status, performance_index, performers, inputs, social_medias, songs } = updateData;
    
    const updates: string[] = [];
    const values: any[] = [];
    
    if (status !== undefined) {
        updates.push('status = ?');
        values.push(status);
    }
    if (performance_index !== undefined) {
        updates.push('performance_index = ?');
        values.push(performance_index);
    }
    if (performers !== undefined) {
        updates.push('performers = ?');
        values.push(performers);
    }
    if (inputs !== undefined) {
        updates.push('inputs = ?');
        values.push(inputs);
    }
    if (social_medias !== undefined) {
        updates.push('social_medias = ?');
        // Handle both string and object formats
        const socialMediasValue = typeof social_medias === 'string' 
            ? social_medias 
            : JSON.stringify(social_medias);
        values.push(socialMediasValue);
    }
    if (songs !== undefined) {
        updates.push('songs = ?');
        // Handle both string and array formats
        const songsValue = typeof songs === 'string'
            ? songs
            : JSON.stringify(songs);
        values.push(songsValue);
    }
    
    if (updates.length === 0) {
        return getPerformanceById(performanceId);
    }
    
    values.push(performanceId);
    await query(
        `UPDATE performances SET ${updates.join(', ')} WHERE performance_id = ?`,
        values
    );
    return getPerformanceById(performanceId);
}

export async function deletePerformance(performanceId: number) {
    await query('DELETE FROM performances WHERE performance_id = ?', [performanceId]);
}

export async function updatePerformanceStatus(performanceId: number, status: string) {
    await query(
        'UPDATE performances SET status = ? WHERE performance_id = ?',
        [status, performanceId]
    );
    return getPerformanceById(performanceId);
}

export async function incrementPerformanceLikes(performanceId: number) {
    await query(
        'UPDATE performances SET likes = likes + 1 WHERE performance_id = ?',
        [performanceId]
    );
    return getPerformanceById(performanceId);
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
    const { email, password, first_name, last_name, role = "Guest" } = userData;
    const result = await query(
        'INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
        [email, password, first_name || '', last_name || '', role]
    );
    return { user_id: Number(result.insertId), email, first_name, last_name, role };
}