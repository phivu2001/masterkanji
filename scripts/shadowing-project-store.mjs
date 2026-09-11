import { createServer } from 'node:http';
import { readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HOST = '127.0.0.1';
const PORT = 3200;
const MAX_BODY_BYTES = 8 * 1024 * 1024;
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const libraryPath = resolve(projectRoot, 'src', 'data', 'shadowingLessons.json');
const temporaryPath = `${libraryPath}.tmp`;

const isAllowedOrigin = (origin = '') => /^https?:\/\/(?:localhost|127\.0\.0\.1):31\d{2}$/u.test(origin);

const sendJson = (response, status, value, origin) => {
  if (isAllowedOrigin(origin)) response.setHeader('Access-Control-Allow-Origin', origin);
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.statusCode = status;
  response.end(JSON.stringify(value));
};

const isLessonLibrary = (value) => Array.isArray(value) && value.every((lesson) => (
  lesson
  && typeof lesson === 'object'
  && typeof lesson.id === 'string'
  && typeof lesson.title === 'string'
  && Array.isArray(lesson.segments)
));

const server = createServer(async (request, response) => {
  const origin = request.headers.origin ?? '';
  if (!isAllowedOrigin(origin)) {
    sendJson(response, 403, { error: 'Nguồn truy cập không được phép.' }, origin);
    return;
  }

  response.setHeader('Access-Control-Allow-Origin', origin);
  response.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (request.method === 'OPTIONS') {
    response.statusCode = 204;
    response.end();
    return;
  }

  if (request.url !== '/shadowing-lessons') {
    sendJson(response, 404, { error: 'Không tìm thấy tài nguyên.' }, origin);
    return;
  }

  if (request.method === 'GET') {
    try {
      sendJson(response, 200, JSON.parse(await readFile(libraryPath, 'utf8')), origin);
    } catch {
      sendJson(response, 200, [], origin);
    }
    return;
  }

  if (request.method !== 'PUT') {
    sendJson(response, 405, { error: 'Phương thức không được hỗ trợ.' }, origin);
    return;
  }

  const chunks = [];
  let receivedBytes = 0;
  for await (const chunk of request) {
    receivedBytes += chunk.length;
    if (receivedBytes > MAX_BODY_BYTES) {
      sendJson(response, 413, { error: 'Kho Shadowing vượt quá giới hạn 8 MB.' }, origin);
      return;
    }
    chunks.push(chunk);
  }

  try {
    const library = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!isLessonLibrary(library)) {
      sendJson(response, 400, { error: 'Dữ liệu thư viện Shadowing không hợp lệ.' }, origin);
      return;
    }
    const nextContent = `${JSON.stringify(library, null, 2)}\n`;
    const currentContent = await readFile(libraryPath, 'utf8').catch(() => '');
    if (currentContent === nextContent) {
      sendJson(response, 200, { saved: library.length, unchanged: true }, origin);
      return;
    }
    await writeFile(temporaryPath, nextContent, 'utf8');
    await rename(temporaryPath, libraryPath);
    sendJson(response, 200, { saved: library.length }, origin);
  } catch (error) {
    sendJson(response, 500, { error: error instanceof Error ? error.message : 'Không ghi được kho Shadowing.' }, origin);
  }
});

server.on('error', (error) => {
  console.warn(`[Shadowing] Không thể mở bộ lưu project tại ${HOST}:${PORT}: ${error.message}`);
});

server.listen(PORT, HOST, () => {
  console.log(`[Shadowing] Đang đồng bộ bài học vào ${libraryPath}`);
});

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
