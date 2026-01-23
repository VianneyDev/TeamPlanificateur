import QueryProvider from "@/components/islands/providers/QueryProvider";
import TeamsPanel from "./TeamsPanel";

export default function TeamsPanelWithProvider() {
   return (
      <QueryProvider>
         <TeamsPanel />
      </QueryProvider>
   );
}
