import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import useFetch from '@/services/useFetch'
import { fetchMovieDetails } from '@/services/api'
import { icons } from '@/constants/icons'
import { account, database, removeMovie, saveMovie } from '@/services/appwrite'
import { ID, Query } from 'react-native-appwrite'
import { markAsWatched } from '@/services/appwrite';


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

const MovieDetails = () => {
  const { id } = useLocalSearchParams()

  const {data: movie, loading} = useFetch(() => fetchMovieDetails(id as string))

  const [isSaved, setIsSaved] = useState(false);

  const [isFavorite, setIsFavorite] = useState(false);

  const [isWatched, setIsWatched] = useState(false);

  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        if (!movie?.id) return;
  
        const user = await account.get();
        const res = await database.listDocuments(
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!,
          [
            Query.equal('user_id', user.$id),
            Query.equal('movie_id', movie.id),
          ]
        );
  
        if (res.documents.length > 0) {
          setIsSaved(true);
          setIsFavorite(res.documents[0].isFavorite || false); // <--- Agregado
        } else {
          setIsSaved(false);
          setIsFavorite(false);
        }
      } catch (err) {
        console.error("Error comprobando si está guardada:", err);
      }
    };

    checkIfSaved();
  }, [movie]);

  const handleToggleSave = async () => {
    try {
      if (!movie?.poster_path) {
        Alert.alert('Error', 'No poster disponible');
        return;
      }
  
      if (isSaved) {
        await removeMovie(movie.id);
        setIsSaved(false);
        Alert.alert('Película quitada de la Watchlist');
      } else {
        await saveMovie({
          id: movie.id,
          title: movie.title,
          poster_path: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        });
        setIsSaved(true);
        Alert.alert('Película guardada');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      if (!movie?.poster_path) {
        Alert.alert('Error', 'No poster disponible');
        return;
      }
  
      const user = await account.get();
  
      const res = await database.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_FAVORITE_COLLECTION_ID!, // 🔥 Ojo, ahora usamos otra colección
        [
          Query.equal('user_id', user.$id),
          Query.equal('movie_id', movie.id),
        ]
      );
  
      if (res.documents.length > 0) {
        const document = res.documents[0];
  
        await database.deleteDocument(
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_FAVORITE_COLLECTION_ID!,
          document.$id
        );
  
        setIsFavorite(false);
        Alert.alert('Película quitada de favoritos');
  
      } else {
        await database.createDocument(
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_FAVORITE_COLLECTION_ID!,
          ID.unique(),
          {
            user_id: user.$id,
            movie_id: movie.id,
            title: movie.title,
            poster_path: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            searchTerm: movie.title.toLowerCase(),
          }
        );
  
        setIsFavorite(true);
        Alert.alert('Película marcada como favorita');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };
  
  const handleToggleWatched = async () => {
    try {
      if (!movie?.poster_path) {
        Alert.alert('Error', 'No poster disponible');
        return;
      }

      const user = await account.get();
  
      const res = await database.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_WATCHED_COLLECTION_ID!,
        [
          Query.equal('user_id', user.$id),
          Query.equal('movie_id', movie.id),
        ]
      );
  
      if (res.documents.length > 0) {
        await database.deleteDocument(
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_WATCHED_COLLECTION_ID!,
          res.documents[0].$id
        );
        setIsWatched(false);
        Alert.alert('Película desmarcada como vista');
      } else {
        await database.createDocument(
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_WATCHED_COLLECTION_ID!,
          ID.unique(),
          {
            user_id: user.$id,
            movie_id: movie.id,
            title: movie.title,
            poster_path: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          }
        );
        setIsWatched(true);
        Alert.alert('Película marcada como vista');
      }
    } catch (err: any) {
      console.error("Error al alternar vista:", err.message);
      Alert.alert('Error', err.message);
    }
  };
  

  return (
    <View className='bg-primary flex-1'>
      <ScrollView contentContainerStyle={{paddingBottom: 80}}>
        <View >
          <Image source={{uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`}} className='w-full h-[550px]' resizeMode='stretch'/>
        </View>

        <View className='flex-col items-start justify-center mt-5 px-5 '>
          <Text className='text-white font-bold text-xl'>
            {movie?.title}
          </Text>

          <View className='flex-row items-center gap-x-1 mt-2'>
            <Text className='text-light-200 text-sm'>
              {movie?.release_date?.split("-")[0]}
            </Text>
            <Text className='text-light-200 text-sm'>
              {movie?.runtime}m
            </Text>
          </View>

          <View className='flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2'>
            <Image source={icons.star} className='size-4' />
            <Text className='text-white font-bold text-sm'>
              {((movie?.vote_average ?? 0)/2).toFixed(1)} / 5
            </Text>
            <Text className='text-light-200 text-sm'>
              ({movie?.vote_count} votes)
            </Text>
          </View>

          <TouchableOpacity className='absolute top-5 left-[90%]' onPress={handleToggleSave} >
            <Image 
              source={ isSaved ? icons.saved : icons.save1} 
              className='absolute size-10 bg-black rounded-full'
            /> 
          </TouchableOpacity>

          <TouchableOpacity className='absolute top-5 left-[80%]' onPress={handleToggleFavorite}>
            <Image 
              source={isFavorite ? icons.star : icons.star} 
              className='size-10' 
            />
          </TouchableOpacity>

          <TouchableOpacity className='absolute top-5 left-[70%]' onPress={handleToggleWatched}>
            <Image 
              source={isWatched ? icons.arrow : icons.arrow} // Usá dos íconos distintos si querés un cambio visual
              className='size-10 bg-white rounded-full' 
            />
          </TouchableOpacity>

          <MovieInfo label='Overview' value={movie?.overview} />
          <MovieInfo label='Genres' value={movie?.genres.map((g) => g.name).join(" - ") || 'N/A'} />
          <View className='flex flex-row justify-between w-1/2'>
            <MovieInfo label='Budget' value={`$${(movie?.budget ?? 0)/ 1_000_00} million`} />
            <MovieInfo label='Revenue' value={`$${((movie?.revenue ?? 0)/ 1_000_000).toFixed(1)} million`}/>
          </View>

          <MovieInfo label='Production Companies' value={movie?.production_companies.map((c) => c.name).join(" • ") || 'N/A'} />
        </View>
      </ScrollView>

      <TouchableOpacity className='absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50' onPress={router.back}>
        <Image source={icons.arrow} className='size-5 mr-1 mt-0.5 rotate-180' tintColor="#fff" />
        <Text className='text-white font-semibold text-base'>Go back</Text>
      </TouchableOpacity>
    </View>
  )
}

export default MovieDetails