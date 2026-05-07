FROM oven/bun:latest

WORKDIR /app

# Copy dependency files first for caching
COPY package.json bun.lock ./
RUN bun install

# Copy source code
COPY . .

# Expose the server port
EXPOSE 3001

# Start the server
CMD ["bun", "index.ts"]
