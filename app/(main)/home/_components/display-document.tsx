import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Clock, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@clerk/clerk-react";

export const DisplayDocument = () => {
  const documents = useQuery(api.documents.getSearch);
  const router = useRouter();
  const { user } = useUser();

  const getTimeAgo = (modifiedTime?: number) => {
    if (!modifiedTime) return "Unknown";

    const now = Date.now();
    const diff = now - modifiedTime;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(modifiedTime).toLocaleDateString();
  };

  const handleDocumentClick = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  return (
    <div className="w-full flex justify-center py-8">
      <div className="w-[60%]">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4" />
          <span className=" font-medium">Recently visited</span>
        </div>
        <div className="w-full flex flex-wrap gap-3">
          {documents?.slice(0, 4).map((doc) => (
            <div
              key={doc._id}
              onClick={() => handleDocumentClick(doc._id)}
              className="w-[144px] h-[144px] rounded-lg cursor-pointer hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col overflow-hidden"
            >
              <div className="h-[44px] bg-gray-100 dark:bg-gray-900/50 flex items-center px-3">
                {doc.icon ? (
                  <span className="text-2xl">{doc.icon}</span>
                ) : (
                  <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                )}
              </div>

              <div className="flex-1 px-3 pb-3 pt-2 flex flex-col justify-between">
                <p
                  className="text-sm font-medium line-clamp-2 text-gray-900 dark:text-gray-100"
                  title={doc.title}
                >
                  {doc.title}
                </p>

                <div className="flex items-center gap-1.5 mt-auto">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={user?.imageUrl} />
                    <AvatarFallback className="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {getTimeAgo(doc.modifiedTime)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
