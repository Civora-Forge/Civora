import React from "react";
import { WifiOff } from "lucide-react";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

export const OfflineBanner = () => {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="bg-yellow-100 text-yellow-800 px-4 py-2 flex items-center justify-center text-sm font-medium z-50">
      <WifiOff size={16} className="mr-2" />
      You’re offline. Your report can still be saved on this device.
    </div>
  );
};
