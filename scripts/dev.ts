import { exec, spawn } from "child_process";
import { platform } from "os";

const RUN_HARDHAT_NODE = "yarn workspace @lew/smart-contracts hardhat node";

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

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});

spawn("yarn workspace @lew/web dev", [], {
  stdio: "inherit",
  env: process.env,
  shell: plt === "win32",
});
