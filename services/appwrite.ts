import { Client, Databases, Account, ID, Query } from "react-native-appwrite";
import { checkSession } from "./auth";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;


const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '');

const database = new Databases(client);
const account = new Account(client);

export { account, database, ID };

export const updateSearchCount = async (query: string, movie: Movie) => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("searchTerm", query),
    ]);

    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];
      await database.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        existingMovie.$id,
        {
          count: existingMovie.count + 1,
        }
      );
    } else {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm: query,
        movie_id: movie.id,
        title: movie.title,
        count: 1,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      });
    }
  } catch (error) {
    console.error("Error updating search count:", error);
    throw error;
  }
};

export const getTrendingMovies = async (): Promise<TrendingMovie[] | undefined> => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(10),
      Query.orderDesc("count"),
    ]);

    return result.documents as unknown as TrendingMovie[];
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export const saveMovie = async (movie: {
  id: number | string,
  title: string,
  poster_path?: string,
  poster_url?: string,
  searchTerm?: string, // Este campo debe estar presente en el objeto
}) => {
  try {
    await checkSession();
    const user = await account.get();

    // Verificar si se pasa 'searchTerm', si no, tomar el título como 'searchTerm'
    const searchTerm = movie.searchTerm || movie.title.toLowerCase();
    const posterUrl = movie.poster_url || `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    // Verifica que la variable 'searchTerm' esté correctamente definida antes de crear el documento
    if (!searchTerm) {
      throw new Error('searchTerm es obligatorio');
    }

    const response = await database.createDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!,
      ID.unique(),
      {
        movie_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        user_id: user.$id,
        searchTerm: searchTerm || movie.title.toLowerCase(), // Asegúrate de que se pase correctamente el campo 'searchTerm'
        // posterUrl: movie.poster_url || `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        posterUrl: posterUrl,
      }
    );

    return response;
  } catch (error) {
    console.error('Error al guardar película:', error);
    // throw new Error('No se pudo guardar la película: ' + error.message);
  }
};

export const getSavedMovies = async () => {
  try {
    const user = await account.get();

    const res = await database.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.equal('user_id', user.$id)]
    );

    return res.documents;
  } catch (error) {
    console.error("Error al obtener películas guardadas:", error);
    throw error;
  }
};

export const register = async (email: string, password: string, name: string) => {
  await account.create(ID.unique(), email, password, name);
  return login(email, password);
};

export const login = async (email: string, password: string) => {
  
  await account.createEmailPasswordSession(email, password);
  return await account.get();
};

export const logout = async () => {
  await account.deleteSession('current');
};

export const getCurrentUser = async () => {
  return await account.get();
};

export const removeMovie = async (movieId: number | string) => {
  const user = await account.get();

  // Buscar documento correspondiente al usuario y película
  const res = await database.listDocuments(
    process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!,
    [
      Query.equal('user_id', user.$id),
      Query.equal('movie_id', movieId),
    ]
  );

  if (res.documents.length > 0) {
    await database.deleteDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!,
      res.documents[0].$id
    );
  }
};

export const getSavedMoviesCount = async (userId: string) => {
  try {
    const res = await database.listDocuments(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!,
      [Query.equal('user_id', userId)] // Filtramos por el user_id
    );
    return res.documents.length; // Devuelve el número de documentos
  } catch (error) {
    console.error('Error al obtener películas guardadas:', error);
    return 0;
  }
};


export const saveFavorite = async (movie: {
  id: number;
  title: string;
  poster_path: string;
}) => {
  const user = await account.get();
  return await database.createDocument(
    process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!, // <-- Usa la DATABASE_ID
    process.env.EXPO_PUBLIC_APPWRITE_FAVORITE_COLLECTION_ID!, // <-- NUEVO: Favoritos COLLECTION_ID
    ID.unique(),
    {
      user_id: user.$id,
      movie_id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      searchTerm: movie.title.toLowerCase(),
    }
  );
};

// Borra una película de favoritos
export const removeFavorite = async (movieId: number) => {
  const user = await account.get();
  const res = await database.listDocuments(
    process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.EXPO_PUBLIC_APPWRITE_FAVORITE_COLLECTION_ID!,
    [
      Query.equal('user_id', user.$id),
      Query.equal('movie_id', movieId),
    ]
  );

  if (res.documents.length === 0) {
    throw new Error('Película no encontrada en favoritos.');
  }

  const documentId = res.documents[0].$id;

  return await database.deleteDocument(
    process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.EXPO_PUBLIC_APPWRITE_FAVORITE_COLLECTION_ID!,
    documentId
  );
};

// Lista todas las películas favoritas del usuario
export const getFavorites = async () => {
  const user = await account.get();
  const res = await database.listDocuments(
    process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.EXPO_PUBLIC_APPWRITE_FAVORITE_COLLECTION_ID!,
    [
      Query.equal('user_id', user.$id),
    ]
  );

  return res.documents;
};


export const markAsWatched = async (movie: { id: number; title: string; poster_path: string }) => {
  const user = await account.get();
  return await database.createDocument(
    process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.EXPO_PUBLIC_APPWRITE_WATCHED_COLLECTION_ID!, // Asegúrate de usar la ID correcta
    ID.unique(),
    {
      user_id: user.$id,
      movie_id: movie.id,
      title: movie.title,
      poster_path: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      searchTerm: movie.title.toLowerCase(),
    }
  );
};

export const getWatchedMovies = async () => {
  const user = await account.get();
  const res = await database.listDocuments(
    process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.EXPO_PUBLIC_APPWRITE_WATCHED_COLLECTION_ID!,
    [Query.equal('user_id', user.$id)]
  );
  return res.documents;
};

