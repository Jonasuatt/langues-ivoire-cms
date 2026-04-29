FROM node:20-alpine
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer TOUTES les dépendances (y compris vite pour le build)
RUN npm install

# Copier le code source
COPY . .

# Compiler l'application
RUN npm run build

# Exposer le port
EXPOSE 3001

# Démarrer le serveur
CMD ["node", "server.js"]
