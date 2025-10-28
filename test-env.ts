import "dotenv/config";

console.log(process.env.FIREBASE_PRIVATE_KEY?.slice(0, 50) + "...");
