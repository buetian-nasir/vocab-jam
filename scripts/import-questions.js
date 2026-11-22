import 'dotenv/config';
import { readFile, writeFile } from 'node:fs/promises';
const p=process.env.QUESTION_JSON_PATH||'data/vocabulary_questions.json';
try {const raw=JSON.parse((await readFile(p,'utf8')).replace(/^\uFEFF/,''));const list=Array.isArray(raw)?raw:raw.questions||[];const seen=new Set();let imported=0,skipped=0,invalid=0;for(const q of list){const id=String(q.id||'');const text=String(q.question??q.q??'').trim();if(!text||!Array.isArray(q.options)||q.options.length<2||!Number.isInteger(+q.answer)||+q.answer<0||+q.answer>=q.options.length){invalid++;continue}if(id&&seen.has(id)){skipped++;continue}if(id)seen.add(id);imported++}console.log(`JSON import validation: ${imported} valid, ${skipped} duplicate, ${invalid} invalid. MySQL bulk import is enabled with QUESTION_SOURCE=mysql.`)}catch(e){console.error(`Question import failed: ${e.message}`);process.exitCode=1}

