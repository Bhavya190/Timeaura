require('dotenv').config();
const { Client } = require('pg');

async function testConnection() {
    const url = process.env.DATABASE_URL.replace('?sslmode=require', '');
    const client = new Client({
        connectionString: url,
        ssl: { rejectUnauthorized: false }
    });
    try {
        console.log("Connecting...");
        await client.connect();
        console.log("Connected successfully!");
        const res = await client.query('SELECT NOW()');
        console.log("Time is:", res.rows[0]);
    } catch (err) {
        console.error("Connection Error:", err);
    } finally {
        await client.end();
    }
}

testConnection();
