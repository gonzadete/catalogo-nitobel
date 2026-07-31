## SERVER
cd server
npm init -y
npm add mysql2
npm add cors
npm add dotenv
npm add express
npm add nodemon -D

npm run dev

## CLIENT
cd client
npx create-expo-app .
npm start 


## como leer data desde client

async funtion fetchData(){
    const response = await fetch("http://localhost:8080/todos/1");
    const data = await response.json();
}