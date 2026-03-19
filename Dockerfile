FROM node:lts-alpine
RUN apk --no-cache add curl && npm i -g pnpm
WORKDIR /app
ARG SOURCE_COMMIT
ENV SOURCE_COMMIT=$SOURCE_COMMIT
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /app
RUN pnpm install --frozen-lockfile
COPY . /app
RUN pnpm prisma generate
RUN pnpm run build
ENV TS_NODE_BASEURL=./.build
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -f http://127.1.1.1:3000/health || exit 1
CMD ["pnpm", "run", "serve"]