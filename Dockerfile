FROM node
WORKDIR /app
ARG SOURCE_COMMIT
ENV SOURCE_COMMIT=$SOURCE_COMMIT
COPY package.json /app
RUN npm install
COPY . /app
RUN npm run build
ENV TS_NODE_BASEURL=./.build
HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD curl -f http://127.1.1.1:3000/health || exit 1
CMD ["npm", "run", "serve"]