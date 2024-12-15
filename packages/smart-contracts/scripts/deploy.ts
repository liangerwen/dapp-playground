import { config } from "hardhat";
import { spawn } from "child_process";
import { readdirSync, existsSync } from "node:fs";
import { join } from "path";
import chalk from "chalk";

const MODULE_PATH_PREFIX = "ignition/modules/";
const NETWORK_ARG_PREFIX = "--network";

async function main() {
  const hasNetworkArg = process.argv.includes(NETWORK_ARG_PREFIX);
  const hasModuleArg =
    process.argv.findIndex((arg) => arg.includes(MODULE_PATH_PREFIX)) >= 0;
  const networks = Object.keys(config.networks).filter(
    (network) => network !== "hardhat"
  );
  const modulePath = join(process.cwd(), MODULE_PATH_PREFIX);
  const modules = existsSync(modulePath) ? readdirSync(join(modulePath)) : [];
  const args = process.argv.slice(2);
  const networtArgs = hasNetworkArg
    ? []
    : networks.map((network) => [NETWORK_ARG_PREFIX, network]);
  const moduleArgs = hasModuleArg
    ? []
    : modules.map((i) => [join(MODULE_PATH_PREFIX, i)]);
  let allArgs: string[][] = [];
  if (networtArgs.length === 0 && moduleArgs.length === 0) {
    allArgs = [args];
  } else if (networtArgs.length === 0) {
    allArgs = moduleArgs.map((module) => [...module, ...args]);
  } else if (moduleArgs.length === 0) {
    allArgs = networtArgs.map((network) => [...network, ...args]);
  } else {
    allArgs = networtArgs.flatMap((network) =>
      moduleArgs.map((module) => [...network, ...module, ...args])
    );
  }
  try {
    const errors: string[] = [];
    for (const arg of allArgs) {
      const h = spawn("hardhat", ["ignition", "deploy", ...arg], {
        // stdio: "inherit",
        env: process.env,
        shell: process.platform === "win32",
      });
      h.on("exit", (code) => {
        const mp = join(MODULE_PATH_PREFIX);
        const module = arg
          .find((i) => i.includes(mp))
          ?.split(mp)[1]
          ?.split(".")[0];
        const network =
          arg[arg.findIndex((arg) => arg.includes(NETWORK_ARG_PREFIX)) + 1];
        const color = code === 0 ? chalk.green : chalk.red;
        const message = code === 0 ? "success" : "failed";
        errors.push(color(`Depoly ${message}: ${module} on ${network}`));
        if (errors.length === allArgs.length) {
          console.log(errors.join("\n"));
        }
      });
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
