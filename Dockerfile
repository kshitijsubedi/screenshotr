FROM --platform=linux/amd64 ghcr.io/puppeteer/puppeteer:latest
# Path: /app
WORKDIR /app

# Path: /app/package.json
COPY package.json .

RUN npm install
COPY . .
RUN npm run postinstall

EXPOSE 3000
CMD ["npm", "start"]

