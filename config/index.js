import { config } from "dotenv";
import { createPool } from "mysql2/promise";

config();

export default {
    PORT: process.env.PORT || 3000,
    DB_URL: process.env.DATABASE_URL,
}

// --------------------------------------Database Connection-----------------------------------------------

const db = createPool({
    host: process.env.DBHost,
    user: process.env.DBUser,
    password: process.env.DBPassword,
    database: process.env.DBName,
    port: process.env.DBPort,
    multipleStatements: true,
    connectionLimit: 30 
}
)

db.on('connection', (pool) => {
    if(!pool) throw new Error('Database connection failed');
})

export {db}