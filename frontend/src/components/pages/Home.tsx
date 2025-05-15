import { useMutation } from "@tanstack/react-query";
import Map from "../organisms/Map";
import Navbar from "../organisms/Navbar";
import Sidebar from "../organisms/Sidebar";
import { getPath, getPathNoWeather } from "../../services/pathfinder";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Home() {
  const location = useLocation(); // Read router state
  const sidebarOpenFromLanding = location.state?.sidebarOpen ?? false; // Detect if launched from LandingPage
  const {
    mutate: weatherMutate,
    data: weatherData,
    isPending: weatherIsPending,
    isSuccess: weatherIsSuccess,
  } = useMutation({
    mutationKey: ["route"],
    mutationFn: async ({ from, to }: { from: string; to: string }) =>
      await getPath(from, to),
  });

  const {
    mutate: noWeatherMutate,
    data: noWeatherData,
    isPending: noWeatherIsPending,
    isSuccess: noWeatherIsSuccess,
  } = useMutation({
    mutationKey: ["routeNoWeather"],
    mutationFn: async ({ from, to }: { from: string; to: string }) =>
      await getPathNoWeather(from, to),
  });

  const error = weatherData?.code == 500 || noWeatherData?.code == 500;
  useEffect(() => {
    console.log("weatherData", weatherData);
    console.log("noWeatherData", noWeatherData);
  }, [weatherData, noWeatherData]);

  const weatherMarkers =
    weatherData?.code == 500
      ? []
      : weatherData?.path.map((marker) => ({
          lng: marker.longitude,
          lat: marker.latitude,
          name: marker.navaidId,
        })) ?? [];

  const noWeatherMarkers =
    noWeatherData?.code == 500
      ? []
      : noWeatherData?.path.map((marker) => ({
          lng: marker.longitude,
          lat: marker.latitude,
          name: marker.navaidId,
        })) ?? [];

  return (
    <>
      <Navbar />
      <div className="h-[calc(100vh-50px)]">
        <Map
          weatherMarkers={weatherMarkers}
          noWeatherMarkers={noWeatherMarkers}
        />
        <Sidebar
          mutate={(from, to) => {
            weatherMutate(from, to);
            noWeatherMutate(from, to);
          }}
          isPending={weatherIsPending}
          isError={error}
          isSuccess={weatherIsSuccess}
          defaultOpen={sidebarOpenFromLanding}
        />
      </div>
    </>
  );
}
