"use client";

import { Button } from "./ui/button";
import { Moon, Settings, Sun } from "lucide-react";
import { ThemeType } from "../constants/theme";
import { useTheme } from "next-themes";

const label = {
  [ThemeType.DARK]: <Moon />,
  [ThemeType.LIGHT]: <Sun />,
  [ThemeType.SYSTEM]: <Settings />,
};

const themeToggleSteps = [ThemeType.LIGHT, ThemeType.DARK, ThemeType.SYSTEM];

const ThemeSwitch = () => {
  const { setTheme, theme = ThemeType.LIGHT } = useTheme();

  return (
    <Button
      onClick={() =>
        setTheme(
          (t) =>
            themeToggleSteps[
              (themeToggleSteps.indexOf(t as ThemeType) + 1) %
                themeToggleSteps.length
            ]
        )
      }
      className="size-10 rounded-full"
      variant="outline"
    >
      {label[theme as ThemeType]}
    </Button>
  );
};

export default ThemeSwitch;
