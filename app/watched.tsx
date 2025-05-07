// app/(tabs)/watched.tsx
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { account, database } from '@/services/appwrite';
import { useRouter } from 'expo-router';
import { Query } from 'react-native-appwrite';
import { icons } from '@/constants/icons';

const Watched = () => {
  const [watched, setWatched] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchWatched = async () => {
    try {
      const user = await account.get();
      const res = await database.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_WATCHED_COLLECTION_ID!,
        [Query.equal('user_id', user.$id)]
      );
      setWatched(res.documents);
    } catch (error: any) {
      console.error('Error al obtener películas vistas:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatched();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <Text className="text-white text-lg">Cargando vistas...</Text>
      </View>
    );
  }

  return (
    <View className='bg-primary flex-1 px-5 pt-5'>
      <Text className="text-white text-2xl font-bold mb-4">Películas vistas</Text>
      <FlatList
        data={watched}
        numColumns={3}
        keyExtractor={(item) => item.$id}
        columnWrapperStyle={{ justifyContent: 'flex-start', marginBottom: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/movies/${item.movie_id}`)}
            className="w-[30%] mb-5 mt-1 ml-2 mr-2"
          >
            <Image
              source={{ uri: item.poster_path }}
              className='w-full h-48 rounded-lg'
              resizeMode='cover'
            />
            <Text className='text-white text-1xs mt-2' numberOfLines={2}>
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity className='absolute bottom-5 left-0 right-0 mx-5 bg-white rounded-lg py-3.5 flex flex-row items-center justify-center z-50' onPress={router.back}>
              <Image source={icons.arrow} className='size-5 mr-1 mt-0.5 rotate-180' tintColor="#000000" />
              <Text className='text-black font-semibold text-base'>Go back</Text>
      </TouchableOpacity>
      <View className='mt-5 mb-10'></View>
    </View>
  );
};

export default Watched;
