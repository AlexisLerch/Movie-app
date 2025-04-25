import { View, Text, TouchableOpacity, Image, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link, useLocalSearchParams } from 'expo-router'
import { icons } from '@/constants/icons'
import { account, database, removeMovie, saveMovie } from '@/services/appwrite'
import { checkSession } from '@/services/auth'
import useFetch from '@/services/useFetch'
import { fetchMovieDetails } from '@/services/api'
import { Query } from 'react-native-appwrite'


const MovieCard = ({ id, poster_path, title, vote_average, release_date}: Movie) => {
  // const { id } = useLocalSearchParams()

  const {data: movie, loading} = useFetch(() => fetchMovieDetails(id.toString()))

  const [isSaved, setIsSaved] = useState(false);

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
            Query.equal('movie_id', movie.id)
          ]
        );
        setIsSaved(res.documents.length > 0);
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
        // Alert.alert('Película quitada de la Watchlist');
      } else {
        await saveMovie({
          id: movie.id,
          title: movie.title,
          poster_path: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        });
        setIsSaved(true);
        // Alert.alert('Película guardada');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

    return (
        <View className='w-[30%]'>
          <Link href={`/movies/${id}`} asChild>
            <TouchableOpacity>
              <Image
                source={{
                  uri: poster_path
                    ? `https://image.tmdb.org/t/p/w500${poster_path}`
                    : 'https://placehold.co/600x400/1a1a1a/ffffff.png',
                }}
                className='w-full h-52 rounded-lg'
                resizeMode='cover'
              />
    
              <Text className='text-sm font-bold text-white mt-2' numberOfLines={1}>
                {title}
              </Text>
    
              <View className='flex-row items-center justify-start gap-x-1'>
                <Image source={icons.star} className='size-4' />
                <Text className='text-xs text-white font-bold uppercase'>
                  {(vote_average / 2).toFixed(1)} / 5
                </Text>
              </View>
              <TouchableOpacity onPress={handleToggleSave} className='mt-2 top-[78%] left-[85%] absolute'>
                {/* <Text className='text-xs text-blue-400'>+ Guardar</Text> */}
                <Image source={isSaved ? icons.saved : icons.save1} className='absolute size-5 bg-black rounded-full'/> 
               </TouchableOpacity>
    
              <View className='flex-row items-center justify-between'>
                <Text className='text-xs text-light-300 font-medium mt-1'>
                  {release_date?.split('-')[0]}
                </Text>
                <Text className='text-xs font-medium text-light-300 uppercase'>Movie</Text>
              </View>
            </TouchableOpacity>
          </Link>
    
          
        </View>
      );
    };
    
    export default MovieCard;