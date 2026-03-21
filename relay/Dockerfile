FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY server.js ./

# HuggingFace Spaces 要求使用端口 7860
ENV PORT=7860
EXPOSE 7860

CMD ["node", "server.js"]
