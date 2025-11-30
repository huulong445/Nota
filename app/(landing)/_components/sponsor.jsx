import Image from "next/image";
export default function Sponsor() {
  return (
    <div className="hidden md:flex items-center gap-x-7">
      <p color="gray"></p>
      {/* <Image src="/PH_Logo.svg" height="70" width="190" alt="Logo" /> */}
      <Image src="/OpenAI_Logo.svg" height="70" width="190" alt="Logo" />
      <Image src="/SoICT_Logo.png" height="70" width="190" alt="Logo" />
    </div>
  );
}
