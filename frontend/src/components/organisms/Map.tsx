import { APIProvider, Marker, useMap } from "@vis.gl/react-google-maps";
import { Map as GoogleMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";

interface MapProps {
  markers?: {
    name: string;
    lat: number;
    lng: number;
  }[];
}

export default function Map({ markers }: MapProps) {
  function PolylineOverlay() {
    const map = useMap();

    useEffect(() => {
      if (!map || !window.google) return;

      const polyline = new window.google.maps.Polyline({
        path: markers,
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
            {markers &&
              markers.map((marker) => (
                <Marker
                  key={marker.name}
                  label={marker.name}
                  position={{ lat: marker.lat, lng: marker.lng }}
                />
              ))}
            <PolylineOverlay />
          </GoogleMap>
        </APIProvider>
      </div>
    </>
  );
}
