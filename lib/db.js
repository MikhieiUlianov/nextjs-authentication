import { MongoClient } from "mongodb";

export async function connectToDatabase() {
  const client = await MongoClient.connect(
    "mongodb+srv://mikh:wrihnJumnhRf5d0u@cluster0.ybqit5w.mongodb.net/authentication?retryWrites=true&w=majority&appName=Cluster0"
  );
  return client;
}
