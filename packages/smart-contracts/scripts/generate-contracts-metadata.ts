import chalk from "chalk";
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const getContractName = (path: string) => path.split(".json")[0];

function getActualSourcesForContract(
  sources: Record<string, any>,
  contractName: string,
  content: string
) {
  for (const sourcePath of Object.keys(sources)) {
    const sourceName = sourcePath.split("/").pop()?.split(".sol")[0];
    if (sourceName === contractName) {
      const regex = /contract\s+(\w+)\s+is\s+([^{}]+)\{/;
      const match = content.match(regex);
      if (match) {
        const inheritancePart = match[2];
        // Split the inherited contracts by commas to get the list of inherited contracts
        const inheritedContracts = inheritancePart
          .split(",")
          .map((contract) => `${contract.trim()}.sol`);

        return inheritedContracts;
      }
      return [];
    }
  }
  return [];
}

function getInheritedFunctions(
  sources: Record<string, any>,
  contractName: string,
  content: string
) {
  const actualSources = getActualSourcesForContract(
    sources,
    contractName,
    content
  );
  const inheritedFunctions = {} as Record<string, any>;

  for (const sourceContractName of actualSources) {
    const sourcePath = Object.keys(sources).find((key) =>
      key.includes(`/${sourceContractName}`)
    );
    if (sourcePath) {
      const sourceName = sourcePath?.split("/").pop()?.split(".sol")[0];
      const { abi } = JSON.parse(
        readFileSync(
          join(process.cwd(), "artifacts", sourcePath, `${sourceName}.json`),
          "utf8"
        )
      );
      for (const functionAbi of abi) {
        if (functionAbi.type === "function") {
          inheritedFunctions[functionAbi.name] = sourcePath;
        }
      }
    }
  }

  return inheritedFunctions;
}

const generateContractsMetadata = async () => {
  try {
    const deploymentsPath = join(process.cwd(), "ignition/deployments");
    if (!existsSync(deploymentsPath)) {
      console.warn("Deployments not found. Please run `yarn deploy` first.");
      process.exit(0);
    }
    console.log(chalk.blue("Start generate contracts metadata..."));
    const modules = readdirSync(join(process.cwd(), "ignition/deployments"));
    const contractNames: string[] = [];
    const chainIds: string[] = [];
    const data = modules.reduce<Record<string, any>>((pre, cur) => {
      const chainId = cur.split("-")[1];
      chainIds.push(chainId);
      const contractAdressPath = join(
        deploymentsPath,
        cur,
        "deployed_addresses.json"
      );
      const artifactsPath = join(deploymentsPath, cur, "artifacts");
      const contracts = readdirSync(artifactsPath).filter((f) =>
        /^\w+#\w+\.json$/.test(f)
      );
      const contractAddresses = JSON.parse(
        readFileSync(contractAdressPath, "utf8")
      );
      const data = contracts.reduce<Record<string, any>>((acc, cur) => {
        const name = getContractName(cur);
        const buildInfoPath = JSON.parse(
          readFileSync(join(artifactsPath, `${name}.dbg.json`), "utf8")
        ).buildInfo.replace(/\\/g, "/");
        const { abi, sourceName, contractName } = JSON.parse(
          readFileSync(join(artifactsPath, cur), "utf8")
        );
        const buildInfo = JSON.parse(
          readFileSync(resolve(artifactsPath, buildInfoPath), "utf8")
        );
        if (!contractNames.includes(contractName)) {
          contractNames.push(contractName);
        }
        const content = buildInfo.input.sources[sourceName].content;
        const metadata =
          buildInfo.output.contracts[sourceName][contractName].metadata;
        const sources = metadata ? JSON.parse(metadata).sources ?? {} : {};
        acc[contractName] = {
          address: contractAddresses[name],
          abi,
          inheritedFunctions: getInheritedFunctions(
            sources,
            contractName,
            content
          ),
        };
        return acc;
      }, {});
      pre[chainId] = data;
      return pre;
    }, {});
    writeFileSync(
      join(process.cwd(), "../web/src/constants/contracts.ts"),
      [
        [
          "/**",
          " * This file is autogenerated by `deploy` script.",
          " * You should not edit it manually or your changes might be overwritten.",
          " */",
        ].join("\n"),
        `export type ContractName = ${contractNames
          .map((n) => `"${n}"`)
          .join(" | ")};`,
        `export type ChainId = ${chainIds.join(" | ")};`,
        `export default ${JSON.stringify(data, null, 2)} as const;\n`,
      ].join("\n\n")
    );
    console.log(chalk.green("Generate contracts metadata success!"));
  } catch (e) {
    console.log(chalk.bgRed("Generate contracts metadata failed!"));
    console.log(chalk.red(e));
  }
};

export default generateContractsMetadata;
