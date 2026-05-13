export default function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-crm-gold border-t-transparent"></div>
        <p className="text-crm-gold font-medium tracking-widest text-sm uppercase animate-pulse">Sincronizando Sheets...</p>
      </div>
    </div>
  );
}
