# Node.js 22 kullanıyoruz
FROM node:22

WORKDIR /app

# 1. Ana projenin bağımlılıklarını kur
COPY package*.json ./
RUN npm install

# 2. Frontend bağımlılıklarını kur (Sadece package dosyalarıyla)
COPY mcgshop-frontend/package*.json ./mcgshop-frontend/
RUN cd mcgshop-frontend && npm install

# 3. TÜM DOSYALARI ŞİMDİ KOPYALA (Build için index.html vb. gerekli)
COPY . .

# 4. Şimdi build al (Artık index.html orada olacak)
RUN cd mcgshop-frontend && npm run build

# 5. Build dosyalarını sunucunun okuduğu public klasörüne taşı
RUN cp -r mcgshop-frontend/dist/* ./public/

EXPOSE 5000
CMD ["npm", "start"]