import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

declare global {
    var __openmicMariaDbPool: mariadb.Pool | undefined;
}

function getPool(): mariadb.Pool {
    if (!globalThis.__openmicMariaDbPool) {
        globalThis.__openmicMariaDbPool = mariadb.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: Number(process.env.DB_PORT),
            connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
            bigIntAsNumber: true,
            dateStrings: true,  // Return dates as strings instead of Date objects
        });
    }

    return globalThis.__openmicMariaDbPool;
}

const pool: mariadb.Pool = getPool();

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

// Helper function to convert ISO datetime to MySQL format
function toMySQLDateTime(isoString: string): string {
    // Convert '2026-03-10T02:00:00.000Z' to '2026-03-10 02:00:00'
    return isoString.slice(0, 19).replace('T', ' ');
}

// Helper function to convert MySQL datetime to UTC ISO format
function convertEventDates(event: any): any {
    if (!event) return event;
    
    if (event.start_date && typeof event.start_date === 'string') {
        // If already ISO format with Z, keep as-is
        if (event.start_date.endsWith('Z')) {
            // Already in correct format
        } else if (event.start_date.includes('T')) {
            // ISO format without Z - treat as UTC and add Z
            if (!event.start_date.includes('Z')) {
                event.start_date = event.start_date + 'Z';
            }
        } else {
            // MySQL format 'YYYY-MM-DD HH:MM:SS' - treat as UTC and convert to ISO
            const normalized = event.start_date.replace(' ', 'T') + 'Z';
            event.start_date = normalized;
        }
    }
    
    if (event.end_date && typeof event.end_date === 'string') {
        // If already ISO format with Z, keep as-is
        if (event.end_date.endsWith('Z')) {
            // Already in correct format
        } else if (event.end_date.includes('T')) {
            // ISO format without Z - treat as UTC and add Z
            if (!event.end_date.includes('Z')) {
                event.end_date = event.end_date + 'Z';
            }
        } else {
            // MySQL format 'YYYY-MM-DD HH:MM:SS' - treat as UTC and convert to ISO
            const normalized = event.end_date.replace(' ', 'T') + 'Z';
            event.end_date = normalized;
        }
    }
    
    return event;
}

// Events
export async function getEvents() {
    const events = await query(`
        SELECT
            e.*, 
            COUNT(CASE WHEN p.status = 'COMPLETED' THEN 1 END) AS completed_performances
        FROM events e
        LEFT JOIN performances p ON p.event_id = e.event_id
        GROUP BY e.event_id
        ORDER BY e.start_date DESC
    `);
    return events.map(convertEventDates);
}

export async function getEventById(eventId: number) {
    const result = await query(`
        SELECT
            e.*, 
            COUNT(CASE WHEN p.status = 'COMPLETED' THEN 1 END) AS completed_performances
        FROM events e
        LEFT JOIN performances p ON p.event_id = e.event_id
        WHERE e.event_id = ?
        GROUP BY e.event_id
    `, [eventId]);
    return result?.[0] ? convertEventDates(result[0]) : null;
}

export async function createEvent(eventData: any) {
    const { title, description, start_date, end_date, location, host_names, status, created_by } = eventData;
    const result = await query(
        'INSERT INTO events (title, description, start_date, end_date, location, host_names, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [title, description, toMySQLDateTime(start_date), toMySQLDateTime(end_date), location, host_names || '', status || 'NEW', created_by]
    );
    return { event_id: Number(result.insertId), ...eventData };
}

export async function updateEvent(eventId: number, eventData: any) {
    const { title, description, start_date, end_date, location, host_names, status } = eventData;
    await query(
        'UPDATE events SET title = ?, description = ?, start_date = ?, end_date = ?, location = ?, host_names = ?, status = ? WHERE event_id = ?',
        [title, description, toMySQLDateTime(start_date), toMySQLDateTime(end_date), location, host_names || '', status || 'NEW', eventId]
    );
    return getEventById(eventId);
}

export async function deleteEvent(eventId: number) {
    // First, delete all performances associated with this event
    await query('DELETE FROM performances WHERE event_id = ?', [eventId]);
    // Then delete the event
    await query('DELETE FROM events WHERE event_id = ?', [eventId]);
}

export async function deleteNonCompletedPerformancesByEventId(eventId: number) {
    const result = await query(
        "DELETE FROM performances WHERE event_id = ? AND status <> 'COMPLETED'",
        [eventId]
    );
    return Number(result?.affectedRows || 0);
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

export async function decrementPerformanceLikes(performanceId: number) {
    await query(
        'UPDATE performances SET likes = GREATEST(likes - 1, 0) WHERE performance_id = ?',
        [performanceId]
    );
    return getPerformanceById(performanceId);
}

export async function movePerformanceNext(performanceId: number, eventId: number) {
    // Get all pending performances for this event sorted by index
    const performances = await query(`
        SELECT performance_id, performance_index 
        FROM performances 
        WHERE event_id = ? AND status = 'PENDING'
        ORDER BY performance_index ASC
    `, [eventId]);
    
    if (performances.length === 0) {
        throw new Error('No performances found');
    }
    
    // Find the current performance and the previous one (to move up in queue)
    const currentIndex = performances.findIndex((p: any) => Number(p.performance_id) === Number(performanceId));
    
    if (currentIndex === -1) {
        throw new Error('Performance not found');
    }
    
    if (currentIndex <= 0) {
        // Performance is already first - no action needed
        return getPerformanceById(performanceId);
    }
    
    const currentPerformance = performances[currentIndex];
    const previousPerformance = performances[currentIndex - 1];
    
    // Swap the performance_index values (move current up, previous down)
    await query(
        'UPDATE performances SET performance_index = ? WHERE performance_id = ?',
        [previousPerformance.performance_index, currentPerformance.performance_id]
    );
    
    await query(
        'UPDATE performances SET performance_index = ? WHERE performance_id = ?',
        [currentPerformance.performance_index, previousPerformance.performance_id]
    );
    
    return getPerformanceById(performanceId);
}

// Users
export async function getUserByEmail(email: string) {
    const result = await query('SELECT * FROM users WHERE email = ?', [email]);
    return result?.[0] || null;
}

export async function getUserByUsername(username: string) {
    const result = await query('SELECT * FROM users WHERE username = ?', [username]);
    return result?.[0] || null;
}

export async function getUserById(userId: number) {
    const result = await query('SELECT * FROM users WHERE user_id = ?', [userId]);
    return result?.[0] || null;
}

export async function createUser(userData: any) {
    const { username, email, password, first_name, last_name, role = "Guest" } = userData;
    const result = await query(
        'INSERT INTO users (username, email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
        [username, email, password, first_name || '', last_name || '', role]
    );
    return { user_id: Number(result.insertId), username, email, first_name, last_name, role };
}