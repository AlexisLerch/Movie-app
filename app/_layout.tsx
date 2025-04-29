import { Stack } from "expo-router";
import "./globals.css";
import { StatusBar } from "react-native";

export default function RootLayout() {
  return (
    <>
      <StatusBar hidden={true} />
      <Stack>
        <Stack.Screen
          name="(tabs)" // Ruta para la pantalla principal
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="movies/[id]" // Ruta para los detalles de la película
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="login" // Asegúrate de que el login esté accesible
          options={{
            headerShown: false,
          }}
        />
          <Stack.Screen
          name="favorites" // Asegúrate de que el login esté accesible
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}