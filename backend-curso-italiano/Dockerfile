FROM oven/bun:latest
WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile || bun install

COPY . .
ENV NODE_ENV=production

EXPOSE 4000
CMD ["bun", "run", "start"]
