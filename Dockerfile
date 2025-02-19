FROM node:8

COPY . /app
WORKDIR /app
RUN npm install

CMD cp application public/ 
CMD mkdir public/css && cp css/styles.css public/css/
CMD mv sounds public/
CMD mv images public/

CMD ["node","server.js"]
