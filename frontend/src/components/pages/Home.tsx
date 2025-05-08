import Map from "../organisms/Map";
import Sidebar from "../organisms/Sidebar";

export default function Home() {
  const markers = [{ lat: 22.54992, lng: 0 }];
  return (
    <>
      <div className="h-screen w-full">
        <Map markers={markers} />
        <Sidebar />
      </div>
    </>
  );
}
