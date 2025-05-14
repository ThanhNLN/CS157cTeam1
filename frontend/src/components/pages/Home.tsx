import { useMutation } from "@tanstack/react-query";
import Map from "../organisms/Map";
import Navbar from "../organisms/Navbar";
import Sidebar from "../organisms/Sidebar";
import { getPath } from "../../services/pathfinder";

export default function Home() {
  const { mutate, data, isPending, isSuccess } = useMutation({
    mutationKey: ["route"],
    mutationFn: async ({ from, to }: { from: string; to: string }) =>
      await getPath(from, to),
  });

  const error = data?.code == 500;

  const markers =
    data?.code == 500
      ? []
      : data?.path.map((marker) => ({
          lng: marker.longitude,
          lat: marker.latitude,
          name: marker.navaidId,
        })) ?? [];

  return (
    <>
      <Navbar />
      <div className="h-[calc(100vh-50px)]">
        <Map markers={markers} />
        <Sidebar
          mutate={mutate}
          isPending={isPending}
          isError={error}
          isSuccess={isSuccess}
        />
      </div>
    </>
  );
}
