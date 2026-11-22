import { server } from '../src/server.js';

// Vercel routes all /api/* calls, including /api/socket.io, through this Node function.
export default server;
