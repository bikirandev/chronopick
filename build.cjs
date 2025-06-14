const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Function to execute shell commands
const runCommand = (command) => {
  try {
    console.log(`🔹 Running: ${command}`);
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    console.error(`❌ Error running command: ${command}`);
    process.exit(1);
  }
};

// Step 1: Compile TypeScript
runCommand("tsc");

// Step 2: Copy CSS files from src/ to dist/
const srcDir = path.join(__dirname, "src");
const distDir = path.join(__dirname, "dist");

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Function to copy CSS files recursively
const copyCssFiles = (src, dest) => {
  const files = fs.readdirSync(src);
  files.forEach((file) => {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);

    if (fs.statSync(srcFile).isDirectory()) {
      // If it's a directory, recursively copy
      if (!fs.existsSync(destFile)) {
        fs.mkdirSync(destFile, { recursive: true });
      }
      copyCssFiles(srcFile, destFile);
    } else if (file.endsWith(".css")) {
      fs.copyFileSync(srcFile, destFile);
      console.log(`✔ Copied ${srcFile} -> ${destFile}`);
    }
  });
};

// Copy CSS files
copyCssFiles(srcDir, distDir);

// Step 3: Write `dist/package.json`
const packageJsonPath = path.join(distDir, "package.json");

const packageJsonContent = {
  type: "module",
};

fs.writeFileSync(
  packageJsonPath,
  JSON.stringify(packageJsonContent, null, 2) + "\n"
);
console.log("✔ Successfully written dist/package.json");

// Success message
console.log("🎉 Build completed successfully!");
