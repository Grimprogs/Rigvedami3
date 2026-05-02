import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Rankings = { 
  departments: string[]; 
  jobTitles: string[]; 
  deptToJobs?: Record<string, string[]>; 
};

export type VisibilityMap = Record<string, {
  sees: string[]; // list of department names they can view
  sees_jobs: boolean; // can they see job titles of those they can view?
  sees_profiles: boolean; // can they click the eye button?
}>;

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
        return { departments: [], jobTitles: [], deptToJobs: {} } as Rankings;
      }
      
      const val = data?.value as Rankings;
      return { 
        departments: val?.departments || [], 
        jobTitles: val?.jobTitles || [],
        deptToJobs: val?.deptToJobs || {}
      } as Rankings;
    }
  });
}

export function useUpdateRankings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (value: Rankings) => {
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

export function useVisibilitySettings() {
  return useQuery({
    queryKey: ["app_settings", "visibility"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "visibility_settings")
        .maybeSingle();
      
      if (error) return {} as VisibilityMap;
      return (data?.value as VisibilityMap) || {};
    }
  });
}

export function useUpdateVisibilitySettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (value: VisibilityMap) => {
      const { error } = await supabase
        .from("app_settings")
        .upsert({ key: "visibility_settings", value });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app_settings", "visibility"] });
    }
  });
}
