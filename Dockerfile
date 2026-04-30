FROM node:22
WORKDIR /app

# Bağımlılıkları kopyala ve kur
COPY package*.json ./
RUN npm install

# Frontend bağımlılıklarını kur ve build al
COPY mcgshop-frontend/package*.json ./mcgshop-frontend/
RUN cd mcgshop-frontend && npm install && npm run build

# Tüm dosyaları kopyala
COPY . .

# Build dosyalarını sunucunun okuduğu public klasörüne taşı
RUN cp -r mcgshop-frontend/dist/* ./public/

EXPOSE 5000
CMD ["npm", "start"]