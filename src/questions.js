import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const file = resolve(process.cwd(), process.env.QUESTION_JSON_PATH || 'data/vocabulary_questions.json');
const raw = JSON.parse(readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
const list = Array.isArray(raw) ? raw : raw.questions || [];
const seen = new Set(); const out = []; const errors = [];
for (const [i,q] of list.entries()) {
 const question = String(q.question ?? q.q ?? '').trim(); const options = q.options;
 const answer = Number(q.answer); const id = String(q.id ?? `VOC-${String(i+1).padStart(6,'0')}`);
 const issue = !question ? 'missing question' : !Array.isArray(options) || options.length < 2 ? 'needs at least two options' : options.some(x=>!String(x).trim()) ? 'empty option' : !Number.isInteger(answer) || answer<0 || answer>=options.length ? 'answer index out of range' : seen.has(id) ? 'duplicate id' : null;
 if(issue){errors.push({index:i+1,id,issue});continue} seen.add(id);
 out.push({id,question,word:q.word||'',options:options.map(String),answer,explanation:q.explanation||'',topic:q.topic||'Word Meaning',difficulty:q.difficulty||'medium',exampleSentence:q.exampleSentence||'',synonyms:q.synonyms||[],antonyms:q.antonyms||[]});
}
if(!out.length) throw new Error(`No valid questions in ${file}`);
console.log(`Loaded ${out.length} questions; skipped ${errors.length} invalid records.`); if(errors.length) console.warn(errors.slice(0,20));
export const questions = out;
export function pickQuestions({count=10,topic='all',difficulty='mixed'}={}) {
 const pool = questions.filter(q => (topic==='all'||q.topic.toLowerCase()===topic.toLowerCase()) && (difficulty==='mixed'||q.difficulty===difficulty));
 const shuffled = [...(pool.length?pool:questions)].sort(()=>Math.random()-.5);
 return shuffled.slice(0,Math.min(count,shuffled.length));
}

