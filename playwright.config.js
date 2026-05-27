const { defineConfig, devices } = require("@playwright/test");

const serverCommand = process.platform === "win32"
  ? "python -m http.server 8000"
  : "python3 -m http.server 8000";

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:8000",
    trace: "retain-on-failure"
  },
  webServer: {
    command: serverCommand,
    url: "http://127.0.0.1:8000",
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 15000
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
