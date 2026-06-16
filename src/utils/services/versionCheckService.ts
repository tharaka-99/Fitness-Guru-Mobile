import { Platform } from "react-native";
import * as Application from "expo-application";
import VersionCheck from "react-native-version-check";

const BUNDLE_ID = "com.fitnessguru.mobile";

export interface VersionCheckResult {
  updateRequired: boolean;
  currentVersion: string;
  latestVersion: string;
  storeUrl: string;
}

/**
 * Compares current app version with store version using react-native-version-check
 */
export async function checkAppVersion(options?: {
  mockLatestVersion?: string;
  forceMock?: boolean;
}): Promise<VersionCheckResult> {
  const currentVersion =
    Application.nativeApplicationVersion ||
    VersionCheck.getCurrentVersion() ||
    "1.0.4";

  let latestVersion = currentVersion;
  let storeUrl = "";

  // Get Store Redirection URL based on Platform
  if (Platform.OS === "ios") {
    storeUrl = "https://apps.apple.com/us/app/fitness-guru-lk/id6743677433";
  } else {
    storeUrl = `https://play.google.com/store/apps/details?id=${BUNDLE_ID}`;
  }

  if (options?.forceMock && options.mockLatestVersion) {
    latestVersion = options.mockLatestVersion;
  } else {
    try {
      const liveStoreVersion = await VersionCheck.getLatestVersion({
        packageName: BUNDLE_ID,
        bundleId: BUNDLE_ID,
        ignoreRange: true,
      });

      if (liveStoreVersion) {
        latestVersion = liveStoreVersion;
      }

      // Retrieve official store URLs dynamically if available
      const officialUrl =
        Platform.OS === "ios"
          ? await VersionCheck.getAppStoreUrl({ appID: BUNDLE_ID })
          : await VersionCheck.getPlayStoreUrl({ packageName: BUNDLE_ID });

      if (officialUrl) {
        storeUrl = officialUrl;
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

  // Use react-native-version-check built-in update verification logic
  let updateRequired = false;
  try {
    const updateCheck = await VersionCheck.needUpdate({
      currentVersion,
      latestVersion,
    });
    updateRequired = updateCheck ? updateCheck.isNeeded : false;
  } catch (error) {
    console.warn("Error comparing versions:", error);
  }

  return {
    updateRequired,
    currentVersion,
    latestVersion,
    storeUrl,
  };
}
