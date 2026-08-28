FROM node:22-slim
WORKDIR /app

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

COPY . .
RUN pnpm install --frozen-lockfile

RUN cd apps/web && DATABASE_URL="postgresql://x:x@localhost:5432/x" pnpm exec prisma generate
RUN cd apps/web && DATABASE_URL="postgresql://x:x@localhost:5432/x" pnpm build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
EXPOSE 8080
USER node
CMD ["node", "apps/web/dist/server/entry.mjs"]