// import { account } from './appwrite'; // Asegúrate de que la ruta sea correcta
// import { database } from './appwrite'; // Asegúrate de que la ruta sea correcta
import { Client, Account } from "react-native-appwrite";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const account = new Account(client);


export const checkSession = async () => {
  try {
    // Intenta obtener los detalles del usuario (si está autenticado)
    const user = await account.get();
    return user; // Si llega aquí, el usuario está autenticado
  } catch (err) {
    console.error('Error al verificar la sesión:', err);
    throw new Error('Usuario no autenticado');
  }
};

  
  
  export const getUser = async () => {
    try {
      const user = await account.get();
      return user;
    } catch (err) {
      console.error('Error al obtener el usuario:', err);
      throw new Error('Usuario no autenticado');
    }
  };