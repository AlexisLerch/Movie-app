import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { account, database } from '@/services/appwrite';
import { useRouter } from 'expo-router';
import { Query } from 'react-native-appwrite';

const Favorites = () => {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchFavorite = async () => {
        try {
            const user = await account.get();
            const res = await database.listDocuments(
                process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
                process.env.EXPO_PUBLIC_APPWRITE_FAVORITE_COLLECTION_ID!,
                [
                    Query.equal('user_id', user.$id),
                ]
            );
            setFavorites(res.documents);
        } catch (error: any) {
            console.error('Error al obtener las películas favoritas:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorite();
    }, []);
    if (loading) {
        return (
          <View className="flex-1 justify-center items-center bg-primary">
            <Text className="text-white text-lg">Cargando favoritos...</Text>
          </View>
        );
      }

  return (
    <View className='bg-primary flex-1 px-5 pt-5'>
    <Text className="text-white text-2xl font-bold mb-4">Tus favoritas</Text>

    <FlatList
            data={favorites}
            numColumns={3}
            keyExtractor={(item) => item.$id}
            columnWrapperStyle={{ justifyContent: 'flex-start',  marginBottom: 10}}
            renderItem={({ item }) => (
              <TouchableOpacity
              onPress={() => router.push(`/movies/${item.movie_id}`)} // 👈 Navega al detalle
              className="w-[30%] mb-5 mt-1 ml-2 mr-2"
              >
                <Image
                  source={{ uri: item.poster_path}}
                  className='w-full h-48 rounded-lg'
                  resizeMode='cover'
                />
                <Text className='text-white text-1xs mt-2 ' numberOfLines={2}>
                  {item.title}
                </Text>
            </TouchableOpacity>
            )}
          />
  </View>
  );
};

export default Favorites;
