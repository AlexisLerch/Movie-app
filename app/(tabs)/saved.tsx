// app/(tabs)/Saved.tsx
import { View, Text, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { account, database, getSavedMovies, removeMovie, saveMovie } from '@/services/appwrite';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { icons } from '@/constants/icons';
import { fetchMovieDetails, fetchMovies } from '@/services/api';
import useFetch from '@/services/useFetch';
import { Query } from 'react-native-appwrite';
import { images } from '@/constants/images';

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className='flex-col items-start justify-center mt-5'>
    <Text className='text-light-200 font-normal text-sm'>
      {label}
    </Text>
    <Text className='text-light-100 font-bold text-sm mt-2'>
      {value ||'N/A'}
    </Text>
  </View>
)

const Saved = () => {
  const [movies, setMovies] = useState<any[]>([]);
  const router = useRouter();

  const { id } = useLocalSearchParams()

  const {data: movie, loading} = useFetch(() => fetchMovieDetails(id as string))

  // const [isSaved, setIsSaved] = useState(false);

  // useEffect(() => {
  //   const checkIfSaved = async () => {
  //     try {
  //       if (!movie?.id) return;
  
  //       const user = await account.get();
  //       const res = await database.listDocuments(
  //         process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
  //         process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!,
  //         [
  //           Query.equal('user_id', user.$id),
  //           Query.equal('movie_id', movie.id)
  //         ]
  //       );
  //       setIsSaved(res.documents.length > 0);
  //     } catch (err) {
  //       console.error("Error comprobando si está guardada:", err);
  //     }
  //   };
  
  //   checkIfSaved();
  // }, [movie]);

  // const handleToggleSave = async () => {
  //   try {
  //     if (!movie?.poster_path) {
  //       Alert.alert('Error', 'No poster disponible');
  //       return;
  //     }
  
  //     if (isSaved) {
  //       await removeMovie(movie.id);
  //       setIsSaved(false);
  //       Alert.alert('Película quitada de la Watchlist');
  //     } else {
  //       await saveMovie({
  //         id: movie.id,
  //         title: movie.title,
  //         poster_path: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
  //       });
  //       setIsSaved(true);
  //       Alert.alert('Película guardada');
  //     }
  //   } catch (err: any) {
  //     Alert.alert('Error', err.message);
  //   }
  // };

  useFocusEffect(
    useCallback(() => {
      const fetchSaved = async () => {
        try {
          const saved = await getSavedMovies();
          setMovies(saved);
        } catch (error) {
          console.error('Error al obtener las películas guardadas:', error);
        }
      };
  
      fetchSaved();
    }, [])
  );

  if (movies.length === 0) {
    return (
      <View className='bg-primary flex-1 justify-center items-center px-10'>
        <Image source={require('@/assets/icons/save.png')} className='size-10' tintColor="#fff" />
        <Text className='text-gray-500 text-base mt-4'>No hay películas guardadas</Text>
      </View>
    );
  }


  return (
    <View className='bg-primary flex-1 pt-5'>
      <Image source={images.pattern} className="absolute w-full  z-0" />
      <Text className='text-white text-2xl text-center font-bold mt-5 mb-5'>Películas guardadas</Text>

      <FlatList
        data={movies}
        numColumns={3}
        keyExtractor={(item) => item.$id}
        columnWrapperStyle={{ justifyContent: 'flex-start',  marginBottom: 10}}
        renderItem={({ item }) => (
          <TouchableOpacity
          onPress={() => router.push(`/movies/${item.movie_id}`)} // 👈 Navega al detalle
          className="w-[30%] m-2"
          >
            <Image
              source={{ uri: item.poster_path}}
              className='w-full h-48 rounded-lg'
              resizeMode='cover'
            />
            <Text className='text-white text-1xs mt-2 ' numberOfLines={2}>
              {item.title}
            </Text>
            
        {/* <View className='flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2'>
            <Image source={icons.star} className='size-4' />
            <Text className='text-white font-bold text-sm'>
              {((movie?.vote_average ?? 0)/2).toFixed(1)} / 5
            </Text>
            <Text className='text-light-200 text-sm'>
              ({movie?.vote_count} votes)
            </Text>
        </View>
        <TouchableOpacity className='absolute top-[75%] left-[75%]' onPress={handleToggleSave} >
          <Image source={ isSaved ? icons.saved : icons.save1} className='absolute size-7 bg-black rounded-full'/> 
        </TouchableOpacity> */}
        </TouchableOpacity>
        )}
      />
      <Text className='mt-[10%] mb-[10%]'></Text>
    </View>
  );
};

export default Saved;
