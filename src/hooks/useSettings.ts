import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Rankings = { departments: string[]; jobTitles: string[] };

export function useRankings() {
  return useQuery({
    queryKey: ["app_settings", "rankings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "rankings")
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching rankings:", error);
        return { departments: [], jobTitles: [] } as Rankings;
      }
      
      return (data?.value as Rankings) || { departments: [], jobTitles: [] };
    }
  });
}

export function useUpdateRankings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (value: Rankings) => {
      // Upsert ranking settings into the app_settings table
      const { error } = await supabase
        .from("app_settings")
        .upsert({ key: "rankings", value });
        
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app_settings", "rankings"] });
    }
  });
}
