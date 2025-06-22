"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";

import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  PageIcon,
  GroupIcon,
  UserCircleIcon,
  SettingsIcon,
  ShootingStarIcon,
  MailIcon,
} from "../icons";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; super?: boolean; new?: boolean }[];
  super?: boolean;
};

interface AppSidebarProps {
  userRole: string;
}

const SUPER_ROLES = ["super"];

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: <UserCircleIcon />,
    name: "Users",
    subItems: [
      { name: "Hostess", path: "/hostess", super: false },
      { name: "Performer", path: "/performer", super: false },
    ],
  },
	{
    icon: <UserCircleIcon />,
    name: "Admins",
		path: "/admin",
		super: true,  
  },
  {
    icon: <GroupIcon />,
    name: "Leads",
    path: "/leads",
  },
  {
    name: "Interests",
    icon: <ShootingStarIcon />,
    path: "/interests",
  },
  {
    name: "Sales Stages",
    icon: <PageIcon />,
    path: "/sales-stage",
  },
  {
    name: "Notifications",
    icon: <MailIcon />,
    path: "/notifications",
  },
];

const settingItems: NavItem[] = [
  {
    icon: <SettingsIcon />,
    name: "Settings",
    subItems: [
      { name: "General", path: "/general", super: false },
      { name: "Lead Input Fields", path: "/leadinputform", super: false },
    ],
  },
];

const AppSidebar: React.FC<AppSidebarProps> = ({ userRole }) => {
  const isSuper = SUPER_ROLES.includes(userRole);
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : settingItems;
      items.forEach((nav, index) => {
        nav.subItems?.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({ type: menuType as "main" | "others", index });
            submenuMatched = true;
          }
        });
      });
    });
    if (!submenuMatched) setOpenSubmenu(null);
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      const ref = subMenuRefs.current[key];
      if (ref) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: ref.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) => {
      if (prev && prev.type === menuType && prev.index === index) return null;
      return { type: menuType, index };
    });
  };

  const filterNavItems = (items: NavItem[]) =>
    items
      .map((nav) => {
        const filteredSubItems = nav.subItems?.filter((sub) =>
          isSuper ? sub.super : !sub.super
        );
        return {
          ...nav,
          subItems: filteredSubItems,
        };
      })
      .filter((nav) => {
        // Keep only:
        // - If it has subItems after filtering
        // - OR If it has a path, AND its super property matches the role
        if (nav.subItems?.length) return true;
        if (nav.path !== undefined) {
          return isSuper ? nav.super === true : nav.super !== true;
        }
        return false;
      });

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {filterNavItems(items).map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems && nav.subItems.length > 0 ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              }`}
            >
              <span
                className={`${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && nav.subItems.length > 0 && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 text-gray-900 h-screen transition-all duration-300 z-50 border-r border-gray-200 dark:border-gray-800
        ${isExpanded || isMobileOpen || isHovered ? "w-[260px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="py-8 flex justify-start">
        <Link href="/dashboard">
          {(isExpanded || isHovered || isMobileOpen) ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo_light.png"
                alt="Logo"
                width={220}
                height={64}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo_dark.png"
                alt="Logo"
                width={220}
                height={64}
              />
            </>
          ) : (
            <Image src="/images/favicon.ico" alt="Logo" width={48} height={48} />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="mb-4 text-xs uppercase leading-[20px] text-gray-400">
                {isExpanded || isHovered || isMobileOpen ? "Main" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            <div>
              <h2 className="mb-4 text-xs uppercase leading-[20px] text-gray-400">
                {isExpanded || isHovered || isMobileOpen ? "Settings" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(settingItems, "others")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
