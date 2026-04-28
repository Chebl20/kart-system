FROM node:20-bookworm-slim

WORKDIR /app

RUN mkdir -p /app/data

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/kart.db
ENV PORT=5000

EXPOSE 5000

CMD ["node", "src/server.js"]
