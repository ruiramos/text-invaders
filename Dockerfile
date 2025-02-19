FROM node:8

COPY . /app
WORKDIR /app
RUN npm install

CMD cp application.js public/ 
CMD mkdir public/css && cp css/styles.css public/css
CMD cp -r sounds public/
CMD cp -r images public/

CMD ["node","server.js"]
