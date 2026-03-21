FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# Expose host so Vite can be accessed from outside the container
CMD ["npm", "run", "dev", "--", "--host"]
