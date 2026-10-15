FROM node:24-alpine

RUN npm install --global pnpm@10.30.3
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
WORKDIR /app

RUN pnpm config set store-dir /pnpm/store
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .

EXPOSE 5173
CMD ["sh", "-c", "pnpm install --frozen-lockfile && exec pnpm dev"]
