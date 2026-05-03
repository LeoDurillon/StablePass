import "../styles/index.css";
import VersionCounter from "./VersionCounter";
import Logo from "../assets/Logo.png";
import { useEffect, useState } from "react";
import { getActiveTabUrl } from "@stable-pass/shared";

export function App() {
  const [domain, setDomain] = useState<string | null>(null);

  useEffect(() => {
    async function getDomain() {
      try {
        const url = await getActiveTabUrl();
        setDomain(url.origin);
      } catch {
        setDomain(null);
      }
    }

    getDomain();
  }, []);

  return (
    <div className="relative z-10 mx-auto flex max-w-80 flex-col items-center gap-4 bg-blue-50 p-8 text-center font-sans text-[#030f2c]">
      <img className="mb-4" src={Logo} alt="Logo" />
      {domain && (
        <>
          <p className="font-medium wrap-break-word">Current Domain ({domain})</p>
          <VersionCounter domain={domain} />
        </>
      )}
    </div>
  );
}

export default App;
