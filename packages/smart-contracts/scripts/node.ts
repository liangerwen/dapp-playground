import { exec } from "child_process";
import { platform } from "os";
import chalk from "chalk";

// 检查端口是否开放
const checkHardhatNode = () => {
  return new Promise<boolean>((resolve) => {
    fetch(`http://localhost:8545`)
      .then(() => resolve(true))
      .catch(() => resolve(false));
  });
};

const main = async () => {
  const running = await checkHardhatNode();
  if (running) {
    console.log(chalk.bgGreenBright("Hardhat node has already running..."));
    process.exit(0);
  }
  const path = process.cwd();

  const RUN_HARDHAT_NODE = `cd ${path} && yarn workspace @lew/smart-contracts hardhat node`;

  const commandOptions: Partial<Record<NodeJS.Platform, string>> = {
    win32: `start cmd.exe /K "${RUN_HARDHAT_NODE}"`,
    darwin: `osascript -e \'tell application "Terminal" to do script "${RUN_HARDHAT_NODE}"\'`,
    linux: `gnome-terminal -- bash -c "${RUN_HARDHAT_NODE}; exec bash"`,
  };

  const plt = platform();

  const command = commandOptions[plt];

  if (!command) {
    console.error(`Unsupported platform: ${plt}`);
    process.exit(1);
  }

  exec(command, (error) => {
    if (error) {
      return console.error(`run hardhat node error: ${error}`);
    }
    console.log(
      chalk.bgGreenBright("Hardhat node has started on new terminal!")
    );
  });
};

main();
