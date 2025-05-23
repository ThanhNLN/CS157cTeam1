import { useMutation } from "@tanstack/react-query";
import Map from "../organisms/Map";
import Navbar from "../organisms/Navbar";
import Sidebar from "../organisms/Sidebar";
import { getPath, getPathNoWeather } from "../../services/pathfinder";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Details from "../organisms/Details";
import { MarkerDto } from "../types/dto";

export default function Home() {
  const location = useLocation(); // Read router state
  const [selectedMarker, setSelectedMarker] = useState<MarkerDto | null>(null);
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

  const { mutate: noWeatherMutate, data: noWeatherData } = useMutation({
    mutationKey: ["routeNoWeather"],
    mutationFn: async ({ from, to }: { from: string; to: string }) =>
      await getPathNoWeather(from, to),
  });

  const error = weatherData?.code == 500 || noWeatherData?.code == 500;
  useEffect(() => {
    console.log("weatherData", weatherData);
    console.log("noWeatherData", noWeatherData);
  }, [weatherData, noWeatherData]);

  const weatherMarkers = weatherData?.code ? [] : weatherData?.path;

  const noWeatherMarkers = noWeatherData?.code ? [] : noWeatherData?.path;

  return (
    <>
      <Navbar />
      <div className="h-screen">
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
        <Map
          weatherMarkers={weatherMarkers}
          noWeatherMarkers={noWeatherMarkers}
          setSelectedMarker={setSelectedMarker}
        />
      </div>
      <Details selectedMarker={selectedMarker} />
    </>
  );
}
