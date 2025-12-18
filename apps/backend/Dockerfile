FROM node:22-slim

WORKDIR /app

# install dev tools globally
RUN npm install -g nodemon tsx

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]