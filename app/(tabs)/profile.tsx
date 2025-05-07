import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Query } from 'react-native-appwrite';
import { icons } from '@/constants/icons';
import { router, useFocusEffect } from 'expo-router';
import { database, account } from '@/services/appwrite';
import { images } from '@/constants/images';


const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [favoriteCount, setFavoriteCount] = useState<number>(0);
  const [watchedCount, setWatchedCount] = useState<number>(0);
  const [favorites, setFavorites] = useState<any[]>([]);

  const fetchUser = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
  
      // Obtener las películas guardadas por el usuario desde Appwrite
      const res = await database.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!,
        // Filtramos por el user_id
        [Query.equal('user_id', currentUser.$id)]
      );
  
      // Guardar el conteo de películas guardadas
      setSavedCount(res.documents.length);

    } catch (error: any) {
      // Manejo de errores: si no se puede obtener el usuario o las películas guardadas, redirigir a la pantalla de inicio de sesión
      console.error('Error al obtener usuario o películas guardadas:', error.message);
      Alert.alert('Sesión caducada', 'Por favor inicia sesión nuevamente.');
      router.replace('/login');
    }
    
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      router.replace('/login');
    } catch (error) {
      Alert.alert('Error al cerrar sesión');
    }
  };

  useEffect(() => {
    // Verificamos si el usuario ya está autenticado
    // Si no hay usuario, llamamos a la función fetchUser para obtener los datos del usuario
    if (!user) {
      fetchUser();
    }
  }, [user]); 

  
  // Función para obtener las películas favoritas del usuario
  const fetchFavoriteMovies = async () => {
    try {
      const user = await account.get();
      const res = await database.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_FAVORITE_COLLECTION_ID!,
        [
          Query.equal('user_id', user.$id),
        ]
      );
      setFavoriteCount(res.documents.length); // Guardamos el conteo de películas favoritas
      setFavorites(res.documents); // Guardamos las películas favoritas
    } catch (error) {
      console.error('Error al obtener las películas favoritas:', error);
    }
  };

  useEffect(() => {
    if (user) {
      // Si el usuario está autenticado, llamamos a la función para obtener las películas favoritas
      fetchFavoriteMovies();
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchUser(); // Vuelve a cargar los datos al enfocar el perfil
    }, [])
  );

  // Función para obtener el conteo de películas vistas
  useFocusEffect(
    useCallback(() => {
      const fetchWatchedCount = async () => {
        try {
          const user = await account.get();
          const res = await database.listDocuments(
            process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.EXPO_PUBLIC_APPWRITE_WATCHED_COLLECTION_ID!,
            [Query.equal("user_id", user.$id)]
          );
          // Guardamos el conteo de películas vistas
          setWatchedCount(res.documents.length);
        } catch (error) {
          console.error("Error al cargar películas vistas:", error);
        }
      };
  
      fetchWatchedCount();
    }, [])
  );

  // renderizado de el perfil del usuario
  return (
    <View className="flex-1 bg-primary py-10">
      <Image source={images.pattern} className="absolute w-full  z-0" />
      {user ? (
        <View className="items-center">
          <Image
            source={icons.person}
            className="w-24 h-24 mb-4"
            tintColor="#fff"
          />
  
          <Text className="text-white text-2xl font-bold mb-1">
            {user.name || 'Usuario'}
          </Text>
          <Text className="text-white text-sm mb-4">{user.email}</Text>

          <View className='flex-row justify-between m-5'>
          {favorites.slice(0, 4).map((movie) => (
            <View className='w-1/4 m-1' key={movie.$id}>
              <Image
                source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
                className='w-full h-36 rounded-lg mb-2'
                resizeMode='cover'
              />
              <Text className='text-white text-sm text-center'>{movie.title}</Text>
            </View>
          ))}
        </View>
  
          {/* Stats estilo Letterboxd */}
          <View className="flex-row justify-between w-full px-8 mt-8 mb-4">
            <TouchableOpacity className="items-center" onPress={() => router.push('/watched')}>
              <Text className="text-white text-lg font-semibold">{watchedCount}</Text>
              <Text className="color-white text-xl">Vistas</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center" onPress={() => router.push('/saved')}>
              <Text className="text-white text-lg font-semibold">{savedCount}</Text>
              <Text className="color-white text-xl">Guardadas</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center" onPress={() => router.push('/favorites')}>
              <Text className="text-white text-lg font-semibold">{favoriteCount}</Text>
              <Text className="color-white text-xl">Favoritas</Text>
            </TouchableOpacity>
          </View>
  
          <TouchableOpacity
            className="bg-white px-6 py-3 rounded-2xl mt-20"
            onPress={logout}
          >
            <Text className="text-black font-bold text-sm ">Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text className="text-light-300 text-center mt-10">Cargando perfil...</Text>
      )}
    </View>
  );
};

export default Profile;
