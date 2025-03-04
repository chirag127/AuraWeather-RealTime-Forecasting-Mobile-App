import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Button } from "react-native";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import axios from "axios";

const API_KEY = "a3e4cd436cc2cbb0c907419be4f189cb";

export default function App() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    registerForPushNotifications();
    getLocation();
  }, []);

  // Request permission for notifications
  const registerForPushNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Permission for notifications denied!");
      return;
    }
  };

  // Get user location
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Location permission denied");
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);
    fetchWeather(loc.coords.latitude, loc.coords.longitude);
  };

  // Fetch weather data
  const fetchWeather = async (lat, lon) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      setWeather(response.data);
      checkForSevereWeather(response.data);
    } catch (error) {
      alert("Error fetching weather data");
    }
    setLoading(false);
  };

  // Check for severe weather and send notification
  const checkForSevereWeather = async (data) => {
    if (data.weather[0].main === "Thunderstorm" || data.weather[0].main === "Extreme") {
      await sendWeatherAlert("⚠️ Severe weather alert: " + data.weather[0].description);
    }
  };

  // Send notification
  const sendWeatherAlert = async (message) => {
    await Notifications.scheduleNotificationAsync({
      content: { title: "Weather Alert", body: message },
      trigger: { seconds: 2 },
    });
  };

  if (loading) return <ActivityIndicator size="large" style={styles.loader} />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Weather App</Text>
      <Text style={styles.info}>📍 Location: {weather.name}</Text>
      <Text style={styles.info}>🌡 Temperature: {weather.main.temp}°C</Text>
      <Text style={styles.info}>🌦 Condition: {weather.weather[0].description}</Text>
      <Button title="Refresh Weather" onPress={() => getLocation()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  loader: { marginTop: 50 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  info: { fontSize: 18, marginBottom: 5 },
});
