import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// tạo bảng trong convex dtb
export default defineSchema({
  documents: defineTable({
    title: v.string(),
    userId: v.string(),
    isArchived: v.boolean(),
    parentDocument: v.optional(v.id("documents")),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.boolean(),
    // _creationTime: v.number(),
    modifiedTime: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    // .index("by_user_creation", ["userId", "_creationTime"]) // sort theo thời gian tạo
    // .index("by_modified_time", ["modifiedTime"])
    .index("by_user_modified", ["userId", "modifiedTime"]) // sort theo thời gian chỉnh sửa + user
    .index("by_user_parent", ["userId", "parentDocument"]),
  templates: defineTable({
    title: v.string(),
    userId: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    content: v.optional(v.string()),
    isPublic: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_public", ["isPublic"]),
});
