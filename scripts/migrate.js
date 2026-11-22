import 'dotenv/config'; import mysql from 'mysql2/promise'; import {readFile} from 'node:fs/promises';
if(!process.env.DB_HOST){console.log('Set DB_HOST in .env to run the MySQL migration.');process.exit(0)}
const c=await mysql.createConnection({host:process.env.DB_HOST,port:+(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD,multipleStatements:true});
await c.query(await readFile('database/migrations/001_initial.sql','utf8'));console.log('Database schema created.');await c.end();
