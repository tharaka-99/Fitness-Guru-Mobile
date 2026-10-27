/**
 * Postinstall patch for expo-modules-core on Windows.
 *
 * Root cause: The `generateStubPCH` task in expo-modules-core's build.gradle
 * naively splits the clang++ compile command by spaces and passes Windows
 * backslash paths to ProcessBuilder. On Windows, backslashes in the path are
 * eaten as escape characters, causing clang++ to receive a malformed path.
 *
 * Fix: Convert backslash paths to forward slashes (NDK clang++ accepts both)
 * and use a proper StreamTokenizer to split the command instead of split(" ").
 */

const fs = require("fs");
const path = require("path");

const buildGradlePath = path.join(
  __dirname,
  "..",
  "node_modules",
  "expo-modules-core",
  "android",
  "build.gradle"
);

if (!fs.existsSync(buildGradlePath)) {
  console.log(
    "[patch-expo-modules-core] build.gradle not found, skipping patch."
  );
  process.exit(0);
}

const original = fs.readFileSync(buildGradlePath, "utf8");

// Check if already patched
if (original.includes("stubHeaderPath")) {
  console.log("[patch-expo-modules-core] Already patched, skipping.");
  process.exit(0);
}

const oldBlock = `          def cmd = entry.command
            // Replace the forced-include path: \`-Xclang -include -Xclang <path>/cmake_pch.hxx\`
            .replaceAll(/-Xclang -include -Xclang [^\\\\s]+cmake_pch\\\\.hxx(?=\\\\s)/, "-Xclang -include -Xclang \${stubHeader.absolutePath}")
            // Replace the source file operand: \`<path>/cmake_pch.hxx.cxx\`
            .replaceAll(/[^\\\\s]+cmake_pch\\\\.hxx\\\\.cxx/, stubHeader.absolutePath)

          def process = new ProcessBuilder(cmd.split(" ").toList())
            .directory(new File(entry.directory))
            .redirectErrorStream(true)
            .start()`;

const newBlock = `          // Use forward slashes so Windows backslashes don't get treated as
          // escape characters when the command string is split into tokens.
          def stubHeaderPath = stubHeader.absolutePath.replace("\\\\", "/")

          def cmd = entry.command
            // Replace the forced-include path: \`-Xclang -include -Xclang <path>/cmake_pch.hxx\`
            .replaceAll(/-Xclang -include -Xclang [^\\\\s]+cmake_pch\\\\.hxx(?=\\\\s)/, "-Xclang -include -Xclang \${stubHeaderPath}")
            // Replace the source file operand: \`<path>/cmake_pch.hxx.cxx\`
            .replaceAll(/[^\\\\s]+cmake_pch\\\\.hxx\\\\.cxx/, stubHeaderPath)

          // Tokenise the command properly so that Windows paths with spaces
          // (or backslashes converted to forward slashes) are handled correctly.
          def tokenizer = new java.io.StreamTokenizer(new java.io.StringReader(cmd))
          tokenizer.resetSyntax()
          tokenizer.whitespaceChars(0, ' '.codePointAt(0))
          tokenizer.wordChars('!'.codePointAt(0), '~'.codePointAt(0))
          tokenizer.quoteChar('"'.codePointAt(0))
          def tokens = []
          while (tokenizer.nextToken() != java.io.StreamTokenizer.TT_EOF) {
            tokens << tokenizer.sval
          }

          def process = new ProcessBuilder(tokens)
            .directory(new File(entry.directory))
            .redirectErrorStream(true)
            .start()`;

// Use a simpler targeted string replace on the critical line
const patched = original
  .replace(
    /def stubHeaderPath = stubHeader\.absolutePath\.replace/,
    "// already patched"
  )
  .replace(
    "def process = new ProcessBuilder(cmd.split(\" \").toList())",
    `// Use forward slashes so Windows backslashes don't get treated as escape characters.
          def stubHeaderPath = stubHeader.absolutePath.replace("\\\\", "/")
          def cmd2 = cmd
            .replaceAll(/(?<=-Xclang -include -Xclang )\\S+cmake_pch\\.hxx(?=\\s)/, stubHeaderPath)
            .replaceAll(/\\S+cmake_pch\\.hxx\\.cxx/, stubHeaderPath)
          def tokenizer = new java.io.StreamTokenizer(new java.io.StringReader(cmd2))
          tokenizer.resetSyntax()
          tokenizer.whitespaceChars(0, (int)' ')
          tokenizer.wordChars((int)'!', (int)'~')
          tokenizer.quoteChar((int)'"')
          def tokens = []
          while (tokenizer.nextToken() != java.io.StreamTokenizer.TT_EOF) { tokens << tokenizer.sval }
          def process = new ProcessBuilder(tokens)`
  );

if (patched === original) {
  console.warn(
    "[patch-expo-modules-core] WARNING: Pattern not found — patch may not have applied. The build.gradle may have changed in a newer version."
  );
} else {
  fs.writeFileSync(buildGradlePath, patched, "utf8");
  console.log("[patch-expo-modules-core] Patch applied successfully.");
}
