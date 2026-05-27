"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function UTMTrackerContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
      const utms = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
      let hasUtms = false;
      
      utms.forEach((utm) => {
        const val = searchParams.get(utm);
        if (val) {
          sessionStorage.setItem(utm, val);
          hasUtms = true;
        }
      });
      
      if (hasUtms) {
        console.log("UTM Parameters successfully captured and stored.");
      }
    }
  }, [searchParams]);

  return null;
}

export function UTMTracker() {
  return (
    <Suspense fallback={null}>
      <UTMTrackerContent />
    </Suspense>
  );
}

// Helper to retrieve UTM parameters from sessionStorage
export function getSavedUTMs() {
  if (typeof window === "undefined" || typeof sessionStorage === "undefined") {
    return {
      utm_source: "",
      utm_medium: "",
      utm_campaign: "",
      utm_content: "",
      utm_term: "",
    };
  }

  return {
    utm_source: sessionStorage.getItem("utm_source") || "",
    utm_medium: sessionStorage.getItem("utm_medium") || "",
    utm_campaign: sessionStorage.getItem("utm_campaign") || "",
    utm_content: sessionStorage.getItem("utm_content") || "",
    utm_term: sessionStorage.getItem("utm_term") || "",
  };
}
