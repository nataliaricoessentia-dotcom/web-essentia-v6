import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Lead {
  id: string;
  email: string;
  consent: boolean;
  resource_title: string;
  created_at: string;
}

const AdminLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("free_resource_leads")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setLeads((data as Lead[]) || []);
        setLoading(false);
      });
  }, []);

  const exportCSV = () => {
    const header = "Email,Recurso,Fecha,Consentimiento\n";
    const rows = leads.map(l =>
      `${l.email},"${l.resource_title}",${new Date(l.created_at).toLocaleDateString("es-ES")},${l.consent ? "Sí" : "No"}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads_recursos.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-muted-foreground font-body py-8 text-center">Cargando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-semibold text-foreground">Leads de recursos</h2>
        {leads.length > 0 && (
          <Button onClick={exportCSV} size="sm" variant="outline" className="gap-2">
            <Download size={16} /> Exportar CSV
          </Button>
        )}
      </div>

      <p className="text-muted-foreground font-body text-sm mb-6">
        Emails capturados a través del formulario de acceso a recursos gratuitos. Total: {leads.length}
      </p>

      <div className="space-y-2">
        {leads.map((l) => (
          <div key={l.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
            <Mail size={16} className="text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-body text-sm font-medium text-foreground">{l.email}</p>
              <p className="font-body text-xs text-muted-foreground">
                {l.resource_title} · {new Date(l.created_at).toLocaleDateString("es-ES")}
              </p>
            </div>
          </div>
        ))}
        {leads.length === 0 && (
          <p className="text-center text-muted-foreground font-body py-8">No hay leads registrados</p>
        )}
      </div>
    </div>
  );
};

export default AdminLeads;
