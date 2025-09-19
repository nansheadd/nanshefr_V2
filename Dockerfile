# Étape de build : on compile l'application Vite
FROM node:20-alpine AS build
WORKDIR /app

# Installation des dépendances
COPY package.json package-lock.json ./
RUN npm ci

# Copie du reste du code
COPY . .

# Variables d'environnement consommées pendant le build
ARG VITE_API_BASE_URL
ARG VITE_STRIPE_PUBLISHABLE_KEY
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_STRIPE_PUBLISHABLE_KEY=${VITE_STRIPE_PUBLISHABLE_KEY}

# Build de production
RUN npm run build

# Étape de runtime : on sert les fichiers statiques
FROM node:20-alpine AS production
WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

ENV NODE_ENV=production
EXPOSE 4173

CMD ["sh", "-c", "serve -s dist -l tcp://0.0.0.0:${PORT:-4173}"]
