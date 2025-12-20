import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    content: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const template = await ctx.db.insert("templates", {
      title: args.title,
      description: args.description,
      icon: args.icon,
      coverImage: args.coverImage,
      content: args.content,
      userId,
      isPublic: args.isPublic ?? false,
      createdAt: Date.now(),
    });
    return template;
  },
});

export const getTemplates = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const templates = await ctx.db
      .query("templates")
      .filter((q) =>
        q.or(q.eq(q.field("userId"), userId), q.eq(q.field("isPublic"), true))
      )
      .collect();
    return templates;
  },
});

export const createFromTemplate = mutation({
  args: {
    templateId: v.id("templates"),
    title: v.optional(v.string()),
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

    const userId = identity.subject;
    const document = await ctx.db.insert("documents", {
      title: args.title || template.title,
      userId,
      icon: template.icon,
      coverImage: template.coverImage,
      content: template.content,
      isArchived: false,
      isPublished: false,
    });

    return document;
  },
});
