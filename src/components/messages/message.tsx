import { useMutationMessage } from "@/hooks/use-mutation-message";
import { useMutationMessages } from "@/hooks/use-mutation-messages";
import { cn } from "@/lib/utils";
import { MessageType } from "@/types/message";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Check,
  Copy,
  Edit,
  MessageSquareCode,
  RefreshCw,
  User2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AutosizeTextarea } from "@/components/ui/autoresize-textarea";
import Markdown from "@/components/markdown";
import logo from "../../../public/icons/128.png";// Import from public folder root

const DEBUG = false;

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isAssistant = message.role === "assistant";
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [messageContent, setMessageContent] = useState(message.content);
  const { edit } = useMutationMessage(message._id);
  const { getMessageBefore } = useMutationMessages(message.chatId);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = async () => {
    try {
      const success = await edit({ content: messageContent });
      if (success) {
        setIsEditing(false);
      }
    } catch (error) {
      toast.error("Failed to update message");
    }
  };

  const handleRegenerate = async () => {
    const previousMessage = getMessageBefore(message._id);
    if (!previousMessage) {
      toast.error("No previous message found to regenerate from");
      return;
    }

    setIsRegenerating(true);
    try {
      await edit(
        {
          content: previousMessage.content,
        },
        previousMessage._id,
      );
    } catch (error) {
      toast.error("Failed to regenerate response");
    } finally {
      setIsRegenerating(false);
    }
  };

  useEffect(() => {
    setMessageContent(message.content);
  }, [message.content]);

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-2 transition-colors group hover:bg-accent/50",
        {
          "border-2 border-red-500": DEBUG,
        },
      )}
      role="listitem"
    >
      <div
        className={cn("flex-shrink-0", {
          "border-2 border-blue-500": DEBUG,
        })}
      >
        <Avatar className="w-9 h-9 bg-white">
          {isAssistant ? (
            <>
              <AvatarImage 
                src={logo} 
                alt="Assistant" 
                className="object-contain p-1" // Added padding and contain to fit logo
              />
              <AvatarFallback className="bg-primary/10">
                <MessageSquareCode className="w-5 h-5 text-primary" />
              </AvatarFallback>
            </>
          ) : (
            <AvatarFallback className="bg-secondary">
              <User2 className="w-5 h-5 text-secondary-foreground" />
            </AvatarFallback>
          )}
        </Avatar>
      </div>

      <div
        className={cn("flex-1 min-w-0", {
          "border-2 border-green-500": DEBUG,
        })}
      >
        <div className="flex gap-2 justify-between items-center">
          <div className="flex gap-2 items-center">
            <span className="font-medium text-foreground">
              {isAssistant ? "Assistant" : "You"}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(message._creationTime).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="flex gap-1 items-center opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className={cn("w-8 h-8 transition-colors", {
                "text-primary": copied,
              })}
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>

            {isAssistant ? (
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={handleRegenerate}
                disabled={isRegenerating}
              >
                <RefreshCw className={cn("w-4 h-4", {
                  "animate-spin": isRegenerating
                })} />
              </Button>
            ) : !isEditing ? (
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={() => {
                  setIsEditing(true);
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
            ) : null}
          </div>
        </div>

        <div
          className={cn("mt-0.5 text-foreground", {
            "border-2 border-yellow-500": DEBUG,
          })}
        >
          {isEditing ? (
            <div className="mt-2">
              <AutosizeTextarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                className="w-full h-full resize-y"
              />
              <div className="flex gap-2 justify-end mt-2">
                <Button size={"sm"} variant={"secondary"} onClick={handleEdit}>
                  Save
                </Button>
                <Button
                  size={"sm"}
                  variant={"outline"}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Markdown content={messageContent} className="prose-base" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
