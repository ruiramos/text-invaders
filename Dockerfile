FROM node:8

COPY . /app
WORKDIR /app
RUN npm install

RUN cp application.js public/
RUN mkdir public/css && cp css/styles.css public/css
RUN cp -r sounds public/
RUN cp -r images public/
RUN cp -r fonts public/

CMD ["node","server.js"]
