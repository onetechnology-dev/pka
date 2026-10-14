FROM mcr.microsoft.com/playwright:v1.61.0-noble

WORKDIR /app

# Copy dependency specifications and install node packages
COPY package*.json ./
RUN npm ci || npm install

# Ensure Playwright browser binaries and dependencies are installed
RUN npx playwright install --with-deps chromium chromium-headless-shell

# Copy remaining source code
COPY . .

# Environment configuration
ENV HOST=0.0.0.0
ENV PORT=7000
ENV NODE_ENV=production

EXPOSE 7000

CMD ["node", "server.js"]

