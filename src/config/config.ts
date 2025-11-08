export type EmbeddingModelType = "Qwen8B" | "E5Large" | "DangVanTuanEmbedding";

export const IMAGE_UPLOAD_PATH = {
  BOOK: {
    COVER_IMAGE: "book/images/covers",
    DETAILED_IMAGE: "book/images/details",
  },
  BOOK_EMBEDDING: {
    SEARCH_INDEX_NAME: "book_vector_index",
    DIMENSION: 1024,
    PATH: "embeddingVector",
    EMBEDDING_MODEL: "Qwen8B",
  },
};

export const BOOK_EMBEDDING_CONFIG = {
  SEARCH_INDEX_NAME: "book_vector_index",
  DIMENSION: 1024,
  PATH: "embeddingVector",
  EMBEDDING_MODEL: "Qwen8B",

  NUMBER_CANDIDATES: 50,
  LIMIT: 10,
};
