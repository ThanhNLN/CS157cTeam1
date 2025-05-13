import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./components/pages/Home";

export default function App() {
  const client = new QueryClient();

  return (
    <>
      <QueryClientProvider client={client}>
        <Home />
      </QueryClientProvider>
    </>
  );
}
