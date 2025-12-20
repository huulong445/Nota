"use client";

import { useState, useEffect } from "react";
import { DisplayDocument } from "./_components/display-document";
import { FeaturedTemplate } from "./_components/featured-template";
export default function HomePage() {
  const [greeting, SetGreeting] = useState("");
  useEffect(() => {
    const updateGreetings = () => {
      const hour = new Date().getHours();
      let message = "";
      if (0 < hour && hour < 12) {
        message = "morning";
      } else if (hour >= 12 && hour < 18) {
        message = "afternoon";
      } else {
        message = "evening";
      }
      SetGreeting(message);
    };
    updateGreetings();
    const timer = setInterval(updateGreetings, 60000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="mt-5 w-full">
      <div className="flex items-center justify-center">
        <div className="text-4xl mt-24 dark:text-muted-foreground">
          Good {greeting}
        </div>
      </div>
      <DisplayDocument />
      <FeaturedTemplate />
    </div>
  );
}
