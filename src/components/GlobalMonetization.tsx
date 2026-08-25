"use client";
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../supabase";

export default function GlobalMonetization() {
  const [monetagLink, setMonetagLink] = useState<string | null>(null);
  const isPopunderAttached = useRef(false);

  useEffect(() => {
    let active = true;
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase.from('settings').select('*').eq('id', 'system').single();
        if (error) {
          console.warn("Supabase fetch failed", error);
        }
        
        if (data && active) {
          if (data.monetag_direct_link) {
            setMonetagLink(data.monetag_direct_link);
            localStorage.setItem("monetag_link", data.monetag_direct_link);
          }
        }
      } catch (err) {
        console.error("Monetization configuration error:", err);
      }
    };
    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!monetagLink || isPopunderAttached.current) return;

    // A relatively robust, modern un-blockable click-under technique.
    // It will hook onto the first click on the document body.
    const handleClick = (e: MouseEvent) => {
      // Don't pop on video player controls
      if ((e.target as Element).closest('iframe') || (e.target as Element).closest('video')) {
        return;
      }
      
      const lastPopTime = localStorage.getItem("last_monetag_pop_time");
      const COOLDOWN_HOURS = 4;
      
      if (lastPopTime) {
        const diff = Date.now() - parseInt(lastPopTime, 10);
        if (diff < COOLDOWN_HOURS * 60 * 60 * 1000) {
          return; // Skip if in cooldown
        }
      }

      // We use window.open for direct link in new tab, focusing the current one right back to simulate popunder
      try {
        const newWindow = typeof window !== 'undefined' && window.open(monetagLink, "_blank");
        if (newWindow) {
          // Attempt to keep focus on the main window
          window.focus();
          try {
            newWindow.blur();
          } catch(e){}
          
          localStorage.setItem("last_monetag_pop_time", Date.now().toString());
          // Optional: we can remove the event listener after first trigger per session 
          // to make it less annoying, or leave it to rely on the cooldown logic.
        }
      } catch(err) {
        console.error("Popunder blocked:", err);
      }
    };

    document.addEventListener("click", handleClick, { capture: true });
    isPopunderAttached.current = true;

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      isPopunderAttached.current = false;
    };
  }, [monetagLink]);

  return null;
}
