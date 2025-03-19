import dotenv from "dotenv";

dotenv.config();

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;

export { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID };