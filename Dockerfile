FROM node:22-alpine

RUN npm install -g pnpm@10.12.1

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

COPY src/ ./src/
COPY public/ ./public/

RUN addgroup -g 1001 -S nodejs && \
    adduser -S app -u 1001

RUN chown -R app:nodejs /app
USER app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["pnpm", "start"]
