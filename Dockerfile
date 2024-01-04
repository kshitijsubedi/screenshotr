FROM node:20-alpine

# Path: /app
WORKDIR /app

# Path: /app/package.json
COPY package.json .

RUN npm install
COPY . .
RUN npm run postinstall

EXPOSE 3000
CMD ["npm", "start"]

