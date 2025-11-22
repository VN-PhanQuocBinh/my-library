import mongoose from "mongoose";
import Sach from "../models/Sach.ts";
import type { ISach } from "../types/sach.ts";

import aiController from "../controllers/ai-controller.ts";
import paginate from "../utils/paginate.ts";
import { generateEmbeddingWithHuggingFace } from "../services/ai.service.ts";

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
    console.log(`${colors.magenta}${colors.bright}📚 ${msg}${colors.reset}`);
    console.log(`${colors.magenta}${line}${colors.reset}\n`);
  },
  separator: () =>
    console.log(`${colors.cyan}${"─".repeat(60)}${colors.reset}`),
};

export default async function generateEmbeddings() {
  log.header("EMBEDDING GENERATION PROCESS STARTED");

  try {
    let hasMore = true;
    let batchNumber = 1;
    let totalProcessed = 0;
    let totalSuccess = 0;
    let totalFailed = 0;

    while (hasMore) {
      log.info(`\n\nStarting batch ${batchNumber}...`);

      const { list: books } = await paginate<ISach>(
        { query: { page: 0 } } as any,
        Sach,
        "",
        {
          embeddingVector: { $exists: false },
        }
      );

      if (books.length === 0) {
        hasMore = false;
        log.info("No more books without embeddings found");
        break;
      }

      log.separator();
      log.info(
        `Found ${colors.bright}${books.length}${colors.reset} books without embeddings in batch ${batchNumber}`
      );
      log.progress("Processing books in parallel...");

      // Process each book in parallel with individual progress tracking
      const promises = books.map(async (book, index) => {
        try {
          const textToEmbed = `Book name: ${book.name}.\nAuthor: ${book.author}.\nDescription: ${book.description}`;
          const embedding = await generateEmbeddingWithHuggingFace(textToEmbed);

          if (embedding) {
            await Sach.updateOne(
              { _id: book._id },
              { embeddingVector: embedding }
            );
            log.success(
              `[${index + 1}/${books.length}] ${book.name} - by ${book.author}`
            );
            return { success: true, book: book.name };
          } else {
            log.error(
              `[${index + 1}/${
                books.length
              }] Failed to generate embedding for: ${book.name}`
            );
            return { success: false, book: book.name };
          }
        } catch (error) {
          log.error(
            `[${index + 1}/${books.length}] Error processing ${book.name}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
          return { success: false, book: book.name };
        }
      });

      const results = await Promise.all(promises);

      const batchSuccess = results.filter((r) => r.success).length;
      const batchFailed = results.filter((r) => !r.success).length;

      totalProcessed += books.length;
      totalSuccess += batchSuccess;
      totalFailed += batchFailed;

      log.separator();
      log.success(
        `Batch ${batchNumber} completed: ${batchSuccess}/${books.length} successful`
      );

      if (batchFailed > 0) {
        log.warning(`${batchFailed} books failed in this batch`);
      }

      batchNumber++;
    }

    // Final summary
    log.separator();
    log.header("EMBEDDING GENERATION COMPLETED");
    log.info(
      `Total books processed: ${colors.bright}${totalProcessed}${colors.reset}`
    );
    log.success(
      `Successfully generated: ${colors.bright}${totalSuccess}${colors.reset}`
    );

    if (totalFailed > 0) {
      log.error(
        `Failed to generate: ${colors.bright}${totalFailed}${colors.reset}`
      );
    }

    const successRate =
      totalProcessed > 0
        ? ((totalSuccess / totalProcessed) * 100).toFixed(2)
        : "0";
    log.info(`Success rate: ${colors.bright}${successRate}%${colors.reset}`);

    log.header("PROCESS FINISHED SUCCESSFULLY 🎉");
  } catch (error) {
    log.separator();
    log.error(`Critical error in embedding generation process:`);
    console.error(error);
    log.header("PROCESS TERMINATED WITH ERRORS ❌");
  }
}
