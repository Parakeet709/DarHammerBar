type BundleIdType = string;

interface AppMenuEntryConfigType {
  bundleId: BundleIdType;
  displayName: string;
}

export type LauncherConfigType =
  { type: 'app', bundleId: BundleIdType } |
  { type: 'appMenu', apps: AppMenuEntryConfigType[] };