import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSectionVisibility = () => {
  const [visibility, setVisibility] = useState<Record<string, boolean>>({
    products: false,
    resources: true,
    testimonials: true,
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase
      .from("section_settings")
      .select("section_key, is_visible")
      .then(({ data }) => {
        if (data) {
          const map: Record<string, boolean> = {};
          data.forEach((s) => { map[s.section_key] = s.is_visible; });
          setVisibility(map);
        }
        setLoaded(true);
      });
  }, []);

  return { visibility, loaded };
};
