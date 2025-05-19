import { APIProvider, Marker, useMap } from "@vis.gl/react-google-maps";
import { Map as GoogleMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";
import { MarkerDto } from "../types/dto";

interface MapProps {
  weatherMarkers?: MarkerDto[];
  noWeatherMarkers?: MarkerDto[];
  setSelectedMarker: React.Dispatch<React.SetStateAction<MarkerDto | null>>;
}

export default function Map({
  weatherMarkers,
  noWeatherMarkers,
  setSelectedMarker,
}: MapProps) {
  function WeatherPolylineOverlay() {
    const map = useMap();

    useEffect(() => {
      if (!map || !window.google) return;

      const polyline = new window.google.maps.Polyline({
        path:
          weatherMarkers?.map((marker) => ({
            lng: marker.longitude,
            lat: marker.latitude,
            name: marker.navaidId,
          })) ?? [],
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
      });

      polyline.setMap(map);

      // Cleanup on unmount
      return () => polyline.setMap(null);
    }, [map]);

    return null;
  }

  function NoWeatherPolylineOverlay() {
    const map = useMap();

    useEffect(() => {
      if (!map || !window.google) return;

      const polyline = new window.google.maps.Polyline({
        path:
          noWeatherMarkers?.map((marker) => ({
            lng: marker.longitude,
            lat: marker.latitude,
            name: marker.navaidId,
          })) ?? [],
        geodesic: true,
        strokeColor: "#7777FF",
        strokeOpacity: 1.0,
        strokeWeight: 2,
      });

      polyline.setMap(map);

      // Cleanup on unmount
      return () => polyline.setMap(null);
    }, [map]);

    return null;
  }

  return (
    <>
      <div className="w-[calc(100%-8px-16px)] h-full">
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            defaultCenter={{ lat: 40, lng: -98 }}
            defaultZoom={5}
            gestureHandling={"greedy"}
            disableDefaultUI={true}
          >
            {weatherMarkers
              ? weatherMarkers.map((marker) => (
                  <Marker
                    onClick={() => setSelectedMarker(marker)}
                    key={marker.navaidId}
                    label={marker.navaidId}
                    position={{ lat: marker.latitude, lng: marker.longitude }}
                  />
                ))
              : null}
            {noWeatherMarkers
              ? noWeatherMarkers.map((marker) => {
                  return (
                    <Marker
                      onClick={() => setSelectedMarker(marker)}
                      key={marker.navaidId}
                      label={marker.navaidId}
                      position={{ lat: marker.latitude, lng: marker.longitude }}
                      icon={{
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: "#7777FF",
                        fillOpacity: 1,
                        strokeWeight: 1,
                        strokeColor: "#000000",
                      }}
                    />
                  );
                })
              : []}
            <WeatherPolylineOverlay />
            <NoWeatherPolylineOverlay />
          </GoogleMap>
        </APIProvider>
      </div>
    </>
  );
}
