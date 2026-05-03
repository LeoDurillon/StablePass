import { getVersion, setVersion } from "@stable-pass/shared";
import { useEffect, useState } from "react";

export default function VersionCounter({ domain }: { domain: string }) {
  const [currentVersion, setCurrentVersion] = useState(0);

  useEffect(() => {
    setCurrentVersion(0);
    async function setupVersion() {
      const version = await getVersion(domain);
      if (version !== null) {
        setCurrentVersion(version);
      }
    }

    setupVersion();
  }, [domain]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    async function updateVersion() {
      const version = await getVersion(domain);
      if (currentVersion === 0 || version === currentVersion) return;
      await setVersion(domain, currentVersion);
    }

    timeout = setTimeout(updateVersion, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [currentVersion, domain]);

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">Domain version :</span>
      <div className="flex items-center gap-3 rounded-full border border-gray-300 bg-white px-4 py-1 shadow-md">
        <button
          className="self-stretch font-medium text-gray-800 disabled:text-gray-400"
          onClick={() => {
            if (currentVersion === 1) return;
            setCurrentVersion((prev) => prev - 1);
          }}
          disabled={currentVersion === 1}
        >
          -
        </button>
        <span className="text-center text-sm font-medium text-gray-800">{currentVersion}</span>
        <button
          className="self-stretch font-medium text-gray-800"
          onClick={() => {
            setCurrentVersion((prev) => prev + 1);
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}
