const { spawnSync } = require("child_process");

const M5_VALIDATORS = [
  "scripts/validate-m5-1.js",
  "scripts/validate-m5-2.js",
  "scripts/validate-m5-2a.js",
  "scripts/validate-m5-2b.js",
  "scripts/validate-m5-3.js",
  "scripts/validate-m5-4.js",
  "scripts/validate-m5-5.js",
  "scripts/validate-m5-6.js",
];

function runValidator(scriptPath) {
  const result = spawnSync("node", [scriptPath], {
    stdio: "inherit",
    encoding: "utf-8",
  });

  if (result.status !== 0) {
    throw new Error(`${scriptPath} failed with exit code ${result.status ?? "unknown"}.`);
  }
}

function run() {
  for (const scriptPath of M5_VALIDATORS) {
    runValidator(scriptPath);
  }

  console.log("M5 umbrella validation passed:");
  console.log("- M5.1 through M5.6 validators all passed in sequence.");
}

try {
  run();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`M5 umbrella validation failed: ${message}`);
  process.exit(1);
}
