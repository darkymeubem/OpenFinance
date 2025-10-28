import { initializeApp, getApps, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { ServiceAccount, cert } from "firebase-admin/app";
import "dotenv/config";

let app: App;

// Verificar se as variáveis de ambiente estão configuradas
const firebaseConfigExists =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.FIREBASE_CLIENT_EMAIL;

// Inicializar Firebase Admin (evita múltiplas inicializações)
if (getApps().length === 0 && firebaseConfigExists) {
  // Configuração do Firebase Admin
  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  };

  app = initializeApp({
    credential: cert(serviceAccount),
  });
  console.log("🔥 Firebase Admin inicializado com sucesso!");
} else if (!firebaseConfigExists) {
  console.log("⚠️  Firebase não configurado - verifique o arquivo .env");
  // Criar uma instância "mock" para evitar erros
  app = initializeApp({
    projectId: "demo-project",
  });
} else {
  app = getApps()[0];
}

// Exportar instâncias do Firebase
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
