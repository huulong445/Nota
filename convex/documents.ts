import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { error } from "console";
import { use } from "react";

export const archive = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const existingDocument = await ctx.db.get(args.id);
    if (!existingDocument) {
      throw new Error("Not found");
    }
    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }
    // find children and set Archive (move to trash)
    const recursiveArchive = async (documentId: Id<"documents">) => {
      const children = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentDocument", documentId)
        )
        .collect();
      for (const child of children) {
        await ctx.db.patch(child._id, {
          isArchived: true,
        });
        await recursiveArchive(child._id); // check for children's children
      }
    };

    const document = await ctx.db.patch(args.id, {
      isArchived: true,
    });
    recursiveArchive(args.id); // patch all the children also
    return document;
  },
});

// show note on sidebar
export const getSidebar = query({
  args: {
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user_parent", (q) =>
        q.eq("userId", userId).eq("parentDocument", args.parentDocument)
      )
      .filter((q) => q.eq(q.field("isArchived"), false)) // only display notes that isArchive is false
      .order("desc")
      .collect();

    return documents;
  },
});

// create note
export const create = mutation({
  args: {
    title: v.string(),
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const document = await ctx.db.insert("documents", {
      title: args.title,
      parentDocument: args.parentDocument,
      userId,
      isArchived: false,
      isPublished: false,
      modifiedTime: Date.now(),
    });
    return document;
  },
});

// move document to another parent (drag and drop)
export const moveDocument = mutation({
  args: {
    id: v.id("documents"),
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // Prevent moving a document to itself
    if (args.id === args.parentDocument) {
      throw new Error("Cannot move a document to itself");
    }

    // Prevent moving a document to its own descendant (circular reference)
    if (args.parentDocument) {
      let currentParent: Id<"documents"> | undefined = args.parentDocument;
      while (currentParent) {
        if (currentParent === args.id) {
          throw new Error("Cannot move a document to its own descendant");
        }
        const parentDoc: Doc<"documents"> | null =
          await ctx.db.get(currentParent);
        currentParent = parentDoc?.parentDocument;
      }
    }

    const document = await ctx.db.patch(args.id, {
      parentDocument: args.parentDocument,
      modifiedTime: Date.now(),
    });

    return document;
  },
});

// show notes in trash
export const getTrash = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const document = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), true))
      .order("desc")
      .collect();
    return document;
  },
});

// restore from trash
export const restore = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const recursiveRestore = async (documentId: Id<"documents">) => {
      const children = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentDocument", documentId)
        )
        .collect();

      for (const child of children) {
        await ctx.db.patch(child._id, {
          isArchived: false,
        });
        await recursiveRestore(child._id);
      }
    };

    const options: Partial<Doc<"documents">> = {
      isArchived: false,
      modifiedTime: Date.now(),
    };

    if (existingDocument.parentDocument) {
      const parent = await ctx.db.get(existingDocument.parentDocument);
      if (parent?.isArchived) {
        options.parentDocument = undefined;
      }
    }
    const document = await ctx.db.patch(args.id, options);
    recursiveRestore(args.id);
    return existingDocument;
  },
});

// delete
export const remove = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Not found");
    }
    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const document = await ctx.db.delete(args.id);
    return document;
  },
});

// toggle favorite
export const toggleFavorite = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const document = await ctx.db.patch(args.id, {
      isFavorite: !existingDocument.isFavorite,
      modifiedTime: Date.now(),
    });

    return document;
  },
});

// get favorite documents
export const getFavorites = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user_favorite", (q) =>
        q.eq("userId", userId).eq("isFavorite", true)
      )
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return documents;
  },
});

// search
export const getSearch = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user_modified", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return documents;
  },
});

export const getById = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);

    if (!document) {
      // throw new Error("Not found");
      return null;
    }

    if (document.isPublished && !document.isArchived) {
      return document;
    }
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // throw new Error("Not authenticated");
      return null;
    }

    const userId = identity.subject;
    if (document.userId !== userId) {
      throw new Error("Unauthorized");
    }
    return document;
  },
});

// Get full path of parent documents
export const getDocumentPath = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const path: Array<{ id: Id<"documents">; title: string; icon?: string }> =
      [];

    let currentDoc = await ctx.db.get(args.documentId);

    // Build path by traversing up the parent chain
    while (currentDoc && currentDoc.parentDocument) {
      const parentDoc = await ctx.db.get(currentDoc.parentDocument);
      if (!parentDoc) break;

      // Security check
      if (parentDoc.userId !== userId) break;

      path.unshift({
        id: parentDoc._id,
        title: parentDoc.title,
        icon: parentDoc.icon,
      });

      currentDoc = parentDoc;
    }

    return path;
  },
});

export const update = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const { id, ...rest } = args;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }
    const document = await ctx.db.patch(args.id, {
      ...rest,
      modifiedTime: Date.now(),
    });
    return document;
  },
});

export const removeIcon = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }
    const document = await ctx.db.patch(args.id, {
      icon: undefined,
      modifiedTime: Date.now(),
    });
    return document;
  },
});

export const removeCoverImage = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }
    const document = await ctx.db.patch(args.id, {
      coverImage: undefined,
      modifiedTime: Date.now(),
    });
    return document;
  },
});

export const toggleTemplate = mutation({
  args: {
    id: v.id("documents"),
    isTemplate: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const document = await ctx.db.patch(args.id, {
      isTemplate: args.isTemplate,
      modifiedTime: Date.now(),
    });

    return document;
  },
});

export const getTemplates = query({
  handler: async (ctx) => {
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_template", (q) => q.eq("isTemplate", true))
      .filter((q) =>
        q.and(
          q.eq(q.field("isArchived"), false),
          q.eq(q.field("isPublished"), true)
        )
      )
      .order("desc")
      .collect();

    return documents;
  },
});

export const createFromTemplate = mutation({
  args: {
    templateId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    if (!template.isTemplate) {
      throw new Error("Document is not a template");
    }

    const userId = identity.subject;

    // Recursive function to copy a document and its children
    const copyDocumentWithChildren = async (
      sourceDocId: Id<"documents">,
      parentDocId?: Id<"documents">
    ): Promise<Id<"documents">> => {
      const sourceDoc = await ctx.db.get(sourceDocId);
      if (!sourceDoc) {
        throw new Error("Source document not found");
      }

      // Create the new document
      const newDocId = await ctx.db.insert("documents", {
        title: parentDocId ? sourceDoc.title : sourceDoc.title + " (Copy)",
        userId,
        parentDocument: parentDocId,
        icon: sourceDoc.icon,
        coverImage: sourceDoc.coverImage,
        content: sourceDoc.content,
        isArchived: false,
        isPublished: false,
        modifiedTime: Date.now(),
      });

      // Find and copy all children
      const children = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", sourceDoc.userId).eq("parentDocument", sourceDocId)
        )
        .collect();

      // Recursively copy each child
      for (const child of children) {
        await copyDocumentWithChildren(child._id, newDocId);
      }

      return newDocId;
    };

    // Start the recursive copy from the template
    const documentId = await copyDocumentWithChildren(args.templateId);

    return documentId;
  },
});
