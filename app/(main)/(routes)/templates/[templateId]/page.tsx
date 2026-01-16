"use client";
import { use, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Editor } from "@/components/editor";
import { Button } from "@/components/ui/button";
import { ExternalLink, Plus, Star, Trash2, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/clerk-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface TemplatePageProps {
  params: Promise<{
    templateId: Id<"documents">;
  }>;
}

export default function TemplatePage({ params }: TemplatePageProps) {
  const router = useRouter();
  const { templateId } = use(params);
  const { user } = useUser();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const template = useQuery(api.documents.getById, {
    documentId: templateId,
  });

  const reviews = useQuery(api.documents.getTemplateReviews, {
    templateId: templateId,
  });

  const templateRating = useQuery(api.documents.getTemplateRating, {
    templateId: templateId,
  });

  const createFromTemplate = useMutation(api.documents.createFromTemplate);
  const addReview = useMutation(api.documents.addTemplateReview);
  const deleteReview = useMutation(api.documents.deleteTemplateReview);
  const deleteTemplate = useMutation(api.documents.deleteTemplate);

  const isAuthor = user?.id && template?.userId === user.id;

  const handleCreateFromTemplate = async () => {
    try {
      const documentId = await createFromTemplate({
        templateId: templateId,
      });
      toast.success("Document created from template!");
      router.push(`/documents/${documentId}`);
    } catch (_error) {
      toast.error("Failed to create document from template");
    }
  };

  const handleViewPublished = () => {
    if (template?.isPublished) {
      window.open(`/preview/${templateId}`, "_blank");
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await addReview({
        templateId: templateId,
        rating: rating,
        comment: comment || undefined,
      });
      toast.success("Review submitted!");
      setRating(0);
      setComment("");
    } catch (_error) {
      toast.error("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: Id<"templateReviews">) => {
    try {
      await deleteReview({ reviewId });
      toast.success("Review deleted");
    } catch (_error) {
      toast.error("Failed to delete review");
    }
  };

  const handleDeleteTemplate = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this template? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteTemplate({ templateId });
      toast.success("Template deleted");
      router.push("/templates");
    } catch (_error) {
      toast.error("Failed to delete template");
    }
  };

  if (template === undefined) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <Skeleton className="h-12 w-[600px] mb-4" />
          <Skeleton className="h-10 w-[400px] mb-8" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-[150px]" />
            <Skeleton className="h-10 w-[150px]" />
          </div>
        </div>
      </div>
    );
  }

  if (template === null || !template.isTemplate) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Template not found</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col items-center p-8">
        <div className="flex gap-8 items-start max-w-6xl w-full">
          {/* Left Panel - Template Info & Actions */}
          <div className="w-[400px] flex flex-col space-y-6">
            <div className="space-y-4">
              {template.icon && (
                <div className="flex justify-start">
                  <span className="text-6xl">{template.icon}</span>
                </div>
              )}

              <div className="space-y-2">
                <h1 className="text-3xl font-bold">{template.title}</h1>
                {template.authorName && (
                  <p className="text-sm text-muted-foreground">
                    By {template.authorName}
                  </p>
                )}
                {templateRating && templateRating.totalReviews > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= templateRating.averageRating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {templateRating.averageRating} (
                      {templateRating.totalReviews} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleCreateFromTemplate}
                className="w-full"
                size="lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>

              {template.isPublished && (
                <Button
                  onClick={handleViewPublished}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              )}

              {isAuthor && (
                <Button
                  onClick={handleDeleteTemplate}
                  variant="destructive"
                  className="w-full"
                  size="lg"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Template
                </Button>
              )}
            </div>
          </div>

          {/* Right Panel - Preview as Image */}
          <div
            className="w-[784px] h-[490px] bg-background rounded-lg shadow-lg border overflow-hidden relative"
            style={{
              transform: "scale(1)",
              transformOrigin: "top left",
            }}
          >
            <div className="absolute inset-0 overflow-hidden">
              {template.coverImage && (
                <div className="h-32 w-full overflow-hidden">
                  <img
                    src={template.coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                    onClick={handleViewPublished}
                  />
                </div>
              )}

              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2">
                  {template.icon && (
                    <span className="text-4xl">{template.icon}</span>
                  )}
                  <h2 className="text-2xl font-bold line-clamp-1">
                    {template.title}
                  </h2>
                </div>

                <div className="text-sm text-muted-foreground line-clamp-6 overflow-hidden">
                  <Editor
                    editable={false}
                    onChange={() => {}}
                    initialContent={template.content}
                  />
                </div>
              </div>
            </div>

            {/* Overlay gradient to fade content */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Reviews Section */}
        <div className="w-full max-w-6xl mt-12 space-y-8">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Reviews</h2>
          </div>

          {/* Add Review Form */}
          {user && (
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <h3 className="font-medium">Write a review</h3>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rating:</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1"
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${
                          star <= (hoverRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this template... (optional)"
                className="w-full min-h-[100px] p-3 rounded-md border bg-background resize-none"
              />

              <Button
                onClick={handleSubmitReview}
                disabled={isSubmitting || rating === 0}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews && reviews.length > 0 ? (
              reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-background border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={review.userImage} />
                        <AvatarFallback>
                          {review.userName?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{review.userName}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {user?.id === review.userId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground pl-11">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No reviews yet. Be the first to review this template!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
