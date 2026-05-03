import { getBrowserInstance } from "./storage";

export async function getActiveTabUrl() {
  const browserInstance = getBrowserInstance();
  const tabs = await browserInstance.tabs.query({ active: true, currentWindow: true });
  if (tabs.length === 0) {
    throw new Error("No active tab found");
  }
  const activeTab = tabs[0];
  if (!activeTab?.url) {
    throw new Error("Active tab has no URL");
  }
  return new URL(activeTab.url);
}
