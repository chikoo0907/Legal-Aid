// src/routes/documents.routes.js

import express from "express";
import {
  DOCUMENT_CATEGORIES,
  searchDocuments,
  getDocumentById,
} from "../data/indianLegalDocuments.js";

const router = express.Router();

/**
 * GET /documents
 * ?q=searchText
 * ?category=id_personal
 */
router.get("/", (req, res) => {
  try {
    const { q = "", category = "" } = req.query;

    const items = searchDocuments(q, category);

    res.json({
      success: true,
      categories: DOCUMENT_CATEGORIES,
      count: items.length,
      items,
    });
  } catch (err) {
    console.error("Documents list error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch documents list",
    });
  }
});

/**
 * GET /documents/categories
 */
router.get("/categories", (req, res) => {
  res.json({
    success: true,
    categories: DOCUMENT_CATEGORIES,
  });
});

/**
 * GET /documents/:id
 */
router.get("/:id", (req, res) => {
  try {
    const { id } = req.params;

    const document = getDocumentById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.json({
      success: true,
      document,
    });
  } catch (err) {
    console.error("Get document error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch document",
    });
  }
});

export default router;
