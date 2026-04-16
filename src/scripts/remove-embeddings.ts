import Sach from "../models/Sach";

// Colors for console
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

const log = {
  info: (msg: string) =>
    console.log(`${colors.blue}ℹ️  INFO${colors.reset} | ${msg}`),
  success: (msg: string) =>
    console.log(`${colors.green}✅ SUCCESS${colors.reset} | ${msg}`),
  error: (msg: string) =>
    console.log(`${colors.red}❌ ERROR${colors.reset} | ${msg}`),
  warning: (msg: string) =>
    console.log(`${colors.yellow}⚠️  WARNING${colors.reset} | ${msg}`),
  progress: (msg: string) =>
    console.log(`${colors.cyan}🔄 PROGRESS${colors.reset} | ${msg}`),
  header: (msg: string) => {
    const line = "=".repeat(60);
    console.log(`\n${colors.magenta}${line}${colors.reset}`);
    console.log(`${colors.magenta}${colors.bright}🗑️  ${msg}${colors.reset}`);
    console.log(`${colors.magenta}${line}${colors.reset}\n`);
  },
  separator: () =>
    console.log(`${colors.cyan}${"─".repeat(60)}${colors.reset}`),
};

export default async function removeEmbeddings() {
  log.header("EMBEDDING REMOVAL PROCESS STARTED");

  try {
    log.progress("Scanning database for books with embedding vectors...");

    const countWithEmbeddings = await Sach.countDocuments({
      embeddingVector: { $exists: true },
    });

    log.separator();
    log.info(
      `Found ${colors.bright}${countWithEmbeddings}${colors.reset} books with embedding vectors`
    );

    if (countWithEmbeddings === 0) {
      log.info("No books with embedding vectors found. Nothing to remove.");
      log.header("PROCESS COMPLETED - NOTHING TO REMOVE 📭");
      return;
    }

    log.progress(
      `Proceeding to remove embedding vectors from ${countWithEmbeddings} books...`
    );

    const result = await Sach.updateMany(
      { embeddingVector: { $exists: true } },
      { $unset: { embeddingVector: "" } }
    );

    log.separator();
    log.success(
      `Removed embedding vectors from ${colors.bright}${result.modifiedCount}${colors.reset} books`
    );
    log.info(
      `Total documents matched: ${colors.bright}${result.matchedCount}${colors.reset}`
    );

    // Verify kết quả
    log.progress("Verifying removal process...");
    const remainingCount = await Sach.countDocuments({
      embeddingVector: { $exists: true },
    });

    log.separator();
    log.info(
      `Remaining books with embedding vectors: ${colors.bright}${remainingCount}${colors.reset}`
    );

    if (remainingCount === 0) {
      log.success("All embedding vectors have been successfully removed!");
      log.header("REMOVAL PROCESS COMPLETED SUCCESSFULLY 🎉");
    } else {
      log.warning(
        `${remainingCount} embedding vectors still remain in the database`
      );
      log.header("REMOVAL PROCESS COMPLETED WITH WARNINGS ⚠️");
    }

    // Summary
    log.separator();
    log.info(`Summary:`);
    log.info(
      `• Documents found: ${colors.bright}${countWithEmbeddings}${colors.reset}`
    );
    log.info(
      `• Documents processed: ${colors.bright}${result.matchedCount}${colors.reset}`
    );
    log.info(
      `• Documents modified: ${colors.bright}${result.modifiedCount}${colors.reset}`
    );
    log.info(
      `• Documents remaining: ${colors.bright}${remainingCount}${colors.reset}`
    );
  } catch (error) {
    log.separator();
    log.error("Critical error during embedding removal process:");
    console.error(error);
    log.header("PROCESS TERMINATED WITH ERRORS ❌");
    throw error;
  }
}
