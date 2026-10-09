FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Ne pas tourner en root dans le conteneur (l'utilisateur "node" existe déjà dans l'image)
USER node

EXPOSE 3000

# Docker relance cette commande pour savoir si le back répond vraiment
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --start-interval=2s --retries=3 \
  CMD ["sh", "-c", "wget -qO- \"http://127.0.0.1:${PORT:-3000}/\" > /dev/null || exit 1"]

CMD ["node", "index.js"]
