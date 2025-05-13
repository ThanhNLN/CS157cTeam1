import { APIProvider, Marker } from "@vis.gl/react-google-maps";
import { Map as GoogleMap } from "@vis.gl/react-google-maps";

interface MapProps {
  markers?: {
    name: string;
    lat: number;
    lng: number;
  }[];
}

export default function Map({ markers }: MapProps) {
  return (
    <>
      <div className="w-[calc(100%-8px-16px)] h-full">
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            defaultCenter={{ lat: 22.54992, lng: 0 }}
            defaultZoom={3}
            gestureHandling={"greedy"}
            disableDefaultUI={true}
          >
            {markers &&
              markers.map((marker) => (
                <Marker
                  label={marker.name}
                  position={{ lat: marker.lat, lng: marker.lng }}
                />
              ))}
          </GoogleMap>
        </APIProvider>
      </div>
    </>
  );
}
