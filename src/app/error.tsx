"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center min-h-[400px] space-y-6">
      <div className="flex flex-col items-center space-y-2">
        <h2 className="text-xl font-bold text-crm-red">Error de Conexión a Sheets</h2>
        <p className="text-crm-muted text-sm max-w-md text-center">
          No se pudo sincronizar con la base de datos de Google Sheets. Asegúrate de que las credenciales del Service Account estén configuradas en las variables de entorno.
        </p>
      </div>
      <Button
        onClick={() => reset()}
        className="bg-crm-surface2 border border-crm-line text-crm-text hover:bg-crm-surface hover:text-crm-gold"
      >
        Reintentar Conexión
      </Button>
    </div>
  );
}
