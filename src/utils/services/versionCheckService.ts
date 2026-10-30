import { Platform } from "react-native";
import * as Application from "expo-application";
import VersionCheck from "react-native-version-check";


const BUNDLE_ID = "com.fitnessguru.mobile";
const APPLE_APP_ID = "6743677433";


// Universal App Store & Play Store URLs (No country code in iOS URL so Apple directs user to their local storefront)
export const IOS_STORE_URL = `https://apps.apple.com/app/id${APPLE_APP_ID}`;
export const ANDROID_STORE_URL = `https://play.google.com/store/apps/details?id=${BUNDLE_ID}`;


export interface VersionCheckResult {
  updateRequired: boolean;
  currentVersion: string;
  latestVersion: string;
  storeUrl: string;
}


/**
* Compares two semantic version strings (e.g. "1.0.7" vs "1.0.6")
* Returns:
*  1 if v1 > v2
* -1 if v1 < v2
*  0 if v1 === v2
*/
export function compareVersions(v1: string, v2: string): number {
  const parse = (v: string) =>
    (v || "")
      .replace(/[^0-9.]/g, "")
      .split(".")
      .map((part) => parseInt(part, 10) || 0);


  const parts1 = parse(v1);
  const parts2 = parse(v2);
  const maxLength = Math.max(parts1.length, parts2.length);


  for (let i = 0; i < maxLength; i++) {
    const p1 = parts1[i] ?? 0;
    const p2 = parts2[i] ?? 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}


/**
* Fetches latest version directly from Apple's official iTunes lookup service.
* Avoids native module crashes and country-restriction bugs in react-native-version-check.
*/
async function fetchIosLatestVersion(): Promise<string | null> {
  // 1. Try lookup by Apple App ID
  try {
    const res = await fetch(
      `https://itunes.apple.com/lookup?id=${APPLE_APP_ID}&date=${Date.now()}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.resultCount > 0 && data.results?.[0]?.version) {
        return data.results[0].version;
      }
    }
  } catch (err) {
    console.warn("Failed to fetch iOS store version by ID:", err);
  }


  // 2. Fallback to lookup by bundleId
  try {
    const res = await fetch(
      `https://itunes.apple.com/lookup?bundleId=${BUNDLE_ID}&date=${Date.now()}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.resultCount > 0 && data.results?.[0]?.version) {
        return data.results[0].version;
      }
    }
  } catch (err) {
    console.warn("Failed to fetch iOS store version by bundle ID:", err);
  }


  return null;
}


/**
* Compares current app version with store version using native APIs & reliable store lookup
*/
export async function checkAppVersion(options?: {
  mockLatestVersion?: string;
  forceMock?: boolean;
}): Promise<VersionCheckResult> {
  const currentVersion =
    Application.nativeApplicationVersion ||
    VersionCheck.getCurrentVersion() ||
    "1.0.6";


  let latestVersion = currentVersion;
  const storeUrl = Platform.OS === "ios" ? IOS_STORE_URL : ANDROID_STORE_URL;


  if (options?.forceMock && options.mockLatestVersion) {
    latestVersion = options.mockLatestVersion;
  } else {
    try {
      if (Platform.OS === "ios") {
        const liveVersion = await fetchIosLatestVersion();
        if (liveVersion) {
          latestVersion = liveVersion;
        }
      } else {
        const liveStoreVersion = await VersionCheck.getLatestVersion({
          packageName: BUNDLE_ID,
          ignoreRange: true,
        });


        if (liveStoreVersion) {
          latestVersion = liveStoreVersion;
        }
      }
    } catch (error) {
      console.warn("Failed to fetch live store version:", error);
      // Fail safely to current local version so update is not falsely triggered on error
      latestVersion = currentVersion;
    }


    // Apply mock version if explicitly provided and store check fell back or returned matches
    if (options?.mockLatestVersion && latestVersion === currentVersion) {
      latestVersion = options.mockLatestVersion;
    }
  }


  // Determine if update is required
  let updateRequired = false;
  try {
    const updateCheck = await VersionCheck.needUpdate({
      currentVersion,
      latestVersion,
    });
    updateRequired = updateCheck ? updateCheck.isNeeded : false;
  } catch (error) {
    console.warn("Error comparing versions via VersionCheck:", error);
    updateRequired = compareVersions(latestVersion, currentVersion) > 0;
  }


  // Ensure semver comparison confirms if update is needed
  if (!updateRequired && compareVersions(latestVersion, currentVersion) > 0) {
    updateRequired = true;
  }


  return {
    updateRequired,
    currentVersion,
    latestVersion,
    storeUrl,
  };
}



