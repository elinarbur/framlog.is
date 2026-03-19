FROM node:lts-alpine AS builder
RUN npm i -g pnpm
WORKDIR /app
ARG SOURCE_COMMIT
ENV SOURCE_COMMIT=$SOURCE_COMMIT
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /app
RUN pnpm install --frozen-lockfile
COPY . /app
RUN pnpm prisma generate
RUN pnpm run build

FROM node:lts-alpine AS runner
RUN apk --no-cache add curl bash && npm i -g pnpm
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.build ./ .build
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
# tsconfig-paths needs her
COPY --from=builder /app/tsconfig.json ./tsconfig.json
ENV TS_NODE_BASEURL=./.build
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -f http://127.1.1.1:3000/health || exit 1
CMD ["pnpm", "run", "serve"]