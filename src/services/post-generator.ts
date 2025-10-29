import { CreatePostInput } from "../types/index.js";

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 */
function getDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Genera un nombre de archivo seguro desde un título
 */
export function generateFileName(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD") // Normaliza caracteres especiales
    .replace(/[\u0300-\u036f]/g, "") // Elimina diacríticos
    .replace(/[^a-z0-9\s-]/g, "") // Solo letras, números, espacios y guiones
    .trim()
    .replace(/\s+/g, "-") // Espacios a guiones
    .replace(/-+/g, "-") // Múltiples guiones a uno solo
    .substring(0, 100); // Limita longitud
}

/**
 * Genera el contenido del archivo markdown con front-matter
 */
export function generatePostContent(input: CreatePostInput): string {
  const {
    title,
    description = "",
    image = "",
    tags = [],
    category = "",
    draft = false,
    lang = "",
    content = "",
  } = input;

  const frontMatter = `---
title: ${title}
published: ${getDate()}
description: '${description.replace(/'/g, "''")}'
image: '${image}'
tags: [${tags.map((tag) => `"${tag}"`).join(", ")}]
category: '${category}'
draft: ${draft}
${lang ? `lang: '${lang}'` : ""}
---

${content}
`;

  return frontMatter;
}

/**
 * Obtiene el path completo del archivo en el repositorio
 */
export function getPostPath(fileName: string): string {
  // Asegura que tenga extensión .md
  const fileExtensionRegex = /\.(md|mdx)$/i;
  const finalFileName = fileExtensionRegex.test(fileName)
    ? fileName
    : `${fileName}.md`;

  return `src/content/posts/${finalFileName}`;
}

/**
 * Valida que el nombre de archivo sea seguro
 */
export function isValidFileName(fileName: string): boolean {
  // No permite path traversal, caracteres especiales peligrosos
  const dangerousPatterns = /(\.\.|\/|\\|<|>|\||:|"|\?|\*)/;
  return !dangerousPatterns.test(fileName);
}
