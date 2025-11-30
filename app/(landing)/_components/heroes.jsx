"use client";
import Image from "next/image";
export default function Heroes() {
  return (
    <div className="flex flex-col items-center justify-center max-w-5xl">
      <div className="flex items-center">
        <div className="relative w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] ">
          <Image
            src="/documents.png"
            fill
            className="object-contain block dark:hidden"
            alt="Landing page image"
          />
          <Image
            src="/documents-dark.png"
            fill
            className="object-contain hidden dark:block"
            alt="Landing page image"
          />
        </div>
        <div className="relative w-[400px] h-[400px] hidden md:block">
          <Image
            src="/reading.png"
            fill
            className="object-contain dark:hidden block"
            alt="Landing page image"
          />
          <Image
            src="/reading-dark.png"
            fill
            className="object-contain hidden dark:block"
            alt="Landing page image"
          />
        </div>
      </div>
    </div>
  );
}
