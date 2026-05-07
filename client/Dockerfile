FROM oven/bun:latest

WORKDIR /app

# Copy dependency files first for caching
COPY package.json bun.lock ./
RUN bun install

# Copy source code
COPY . .

# Expose the vite port
EXPOSE 5173

# Start the dev server with host flag for docker access
CMD ["bun", "run", "dev", "--host"]
