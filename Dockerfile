# Stage 1: production
FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
EXPOSE 3000
ENTRYPOINT ["node", "src/index.js"]