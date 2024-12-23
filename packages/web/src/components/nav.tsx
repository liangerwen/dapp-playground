"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import ThemeSwitch from "./theme-switch";
import { __DEV__, WEB_TITLE } from "@/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@radix-ui/react-navigation-menu";
import { navigationMenuTriggerStyle } from "./ui/navigation-menu";
import { cn } from "@/lib/utils";

import Icon from "../assets/icon.png";

const Nav = () => {
  const pathname = usePathname();

  const routes = [
    {
      key: "wallet",
      title: "Wallet",
    },
    {
      key: "nft",
      title: "NFT",
    },
  ];

  if (__DEV__) {
    routes.push({
      key: "__dev",
      title: "Dev",
    });
  }

  return (
    <nav className="w-full h-16 flex items-center px-5 bg-background shadow-sm">
      <Link
        href="/"
        title={WEB_TITLE}
        className="no-underline font-bold text-[1.3em] opacity-90 hover:text-inherit hover:opacity-100 inline-flex gap-2 items-center"
      >
        <Image width={36} height={36} src={Icon} alt={WEB_TITLE} />
        {WEB_TITLE}
      </Link>
      <NavigationMenu className="flex-1">
        <NavigationMenuList className="flex gap-4 px-10">
          {routes.map(({ key, title }) => (
            <NavigationMenuItem key={key}>
              <Link href={`/${key}`} legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "hover:underline data-[active]:bg-accent"
                  )}
                  active={pathname === `/${key}`}
                >
                  {title}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex gap-5">
        <ConnectButton />
        <ThemeSwitch />
      </div>
    </nav>
  );
};

export default Nav;
