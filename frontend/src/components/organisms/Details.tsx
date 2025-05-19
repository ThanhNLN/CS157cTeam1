import { MarkerDto } from "../types/dto";

interface DetailsProps {
  selectedMarker: MarkerDto | null;
}

export default function Details({ selectedMarker }: DetailsProps) {
  return (
    <>
      {selectedMarker && (
        <div className="absolute left-10 bottom-10 h-[200px] w-[300px] z-10 bg-white rounded-xl shadow-2xl p-5 flex flex-col gap-2">
          <div className="font-bold">NAVAID</div>
          <div>
            <div>
              <span className="font-medium">Name:</span>{" "}
              {selectedMarker.navaidId}
            </div>
            <div>
              <span className="font-medium">Latitude:</span>{" "}
              {selectedMarker.latitude}
            </div>
            <div>
              <span className="font-medium">Longitude:</span>{" "}
              {selectedMarker.longitude}
            </div>
          </div>
          <div>
            <span className="font-medium">Name:</span>{" "}
            {selectedMarker.description}
          </div>
        </div>
      )}
    </>
  );
}
