import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

type Props = {
   children: React.ReactNode;
}

export default function QueryProvider({ children }: Props) {
   const [queryClient]  = useState(
      () =>
         new QueryClient({
            defaultOptions: {
               queries: {
                  refetchOnWindowFocus: false,
                  retry: 1,
               },
            },
         }),
   );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}