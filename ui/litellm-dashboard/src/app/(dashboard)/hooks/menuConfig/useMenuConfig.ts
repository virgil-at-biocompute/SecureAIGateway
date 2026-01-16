import { useQuery } from "@tanstack/react-query";
import { createQueryKeys } from "../common/queryKeysFactory";

// Menu item configuration from menu.config.json
export interface MenuItemConfig {
  enabled: boolean;
  label?: string;
  items?: Record<string, MenuItemConfig>;
}

export interface MenuGroupConfig {
  enabled: boolean;
  label?: string;
  items: Record<string, MenuItemConfig>;
}

export interface MenuConfig {
  version: string;
  description?: string;
  menu: {
    ai_gateway: MenuGroupConfig;
    observability: MenuGroupConfig;
    access_control: MenuGroupConfig;
    developer_tools: MenuGroupConfig;
    settings: MenuGroupConfig;
  };
}

// Default config - all items enabled
const defaultMenuConfig: MenuConfig = {
  version: "1.0",
  menu: {
    ai_gateway: { enabled: true, items: {} },
    observability: { enabled: true, items: {} },
    access_control: { enabled: true, items: {} },
    developer_tools: { enabled: true, items: {} },
    settings: { enabled: true, items: {} },
  },
};

const menuConfigKeys = createQueryKeys("menuConfig");

export const getMenuConfig = async (): Promise<MenuConfig> => {
  try {
    // Fetch from UI public folder - try /ui/ path first, then root
    const basePath = window.location.pathname.startsWith("/ui") ? "/ui" : "";
    const response = await fetch(`${basePath}/menu.config.json`);
    if (!response.ok) {
      console.warn("menu.config.json not found, using defaults");
      return defaultMenuConfig;
    }
    const config: MenuConfig = await response.json();
    return config;
  } catch (error) {
    console.warn("Failed to load menu.config.json, using defaults:", error);
    return defaultMenuConfig;
  }
};

export const useMenuConfig = () => {
  return useQuery<MenuConfig>({
    queryKey: menuConfigKeys.list({}),
    queryFn: getMenuConfig,
    staleTime: 5 * 60 * 1000, // 5 minutes - allow for config updates
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Helper to check if a menu item is enabled
export const isMenuItemEnabled = (
  config: MenuConfig | undefined,
  groupKey: keyof MenuConfig["menu"],
  itemKey: string,
  childKey?: string
): boolean => {
  if (!config) return true; // Default to showing if config not loaded

  const group = config.menu[groupKey];
  if (!group?.enabled) return false;

  const item = group.items?.[itemKey];
  if (!item) return true; // Not in config = enabled by default
  if (!item.enabled) return false;

  if (childKey && item.items) {
    const child = item.items[childKey];
    if (!child) return true;
    return child.enabled;
  }

  return true;
};

// Helper to check if a group is enabled
export const isMenuGroupEnabled = (
  config: MenuConfig | undefined,
  groupKey: keyof MenuConfig["menu"]
): boolean => {
  if (!config) return true;
  return config.menu[groupKey]?.enabled ?? true;
};
