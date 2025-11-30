import Logo from "./logo";
import Sponsor from "./sponsor";
import { Button } from "@/components/ui/button";
export default function Footer() {
  return (
    <div className="flex items-center w-full p-6 bg-background z-50 dark:bg-[#1f1f1f]">
      <p className="hidden md:block">Trusted by top teams</p>
      <Sponsor />
      {/* <Logo /> */}
      <div className="md:ml-auto w-full justify-between md:justify-end flex items-center gap-x-2 test-muted-foreground">
        <Button variant="ghost">Privacy policy</Button>
        <Button variant="ghost">Terms and condition</Button>
      </div>
    </div>
  );
}
