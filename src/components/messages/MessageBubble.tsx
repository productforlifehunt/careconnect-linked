import { FileText, ExternalLink } from "lucide-react";
import { extractQuote, stripQuoteMarker } from "@/lib/quote-protocol";
import { QuoteCard } from "./QuoteCard";
import { useTranslation } from "react-i18next";
import { formatDate, formatTime, formatDateTime } from "@/lib/locale";

interface MessageBubbleProps {
  message: any;
  isMe: boolean;
  conversationId?: string;
  otherUserId?: string;
}

export function MessageBubble({ message, isMe, conversationId, otherUserId }: MessageBubbleProps) {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const rawContent: string = message.message_content || message.content || "";
  const quote = extractQuote(rawContent);

  // Render the quote card UI in place of the bubble for quote messages.
  if (quote) {
    return (
      <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
        <QuoteCard
          quote={quote}
          isMe={isMe}
          isRecipient={!isMe}
          conversationId={conversationId}
          otherUserId={otherUserId}
        />
      </div>
    );
  }

  // Attachments live either on a dedicated column (legacy) or as a bare URL on
  // its own line in the body, which is how the chat CCT carries uploads today.
  const bodyText = stripQuoteMarker(rawContent);
  const urlLine = (bodyText.match(/https?:\/\/\S+$/m) || [])[0] || "";
  const attachmentUrl: string = message.attachment_url || urlLine || "";
  const hasAttachment = !!attachmentUrl;
  const isImage = message.message_type === "image" ||
    (hasAttachment && /\.(jpg|jpeg|png|gif|webp|svg|heic)(\?|$)/i.test(attachmentUrl));

  // The raw URL never shows as text — it is rendered as the card below.
  const textContent = urlLine ? bodyText.replace(urlLine, "").trim() : bodyText;

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? "hero-gradient text-primary-foreground rounded-br-md" : "bg-card border rounded-bl-md text-foreground"}`}>
        {/* Attachment */}
        {hasAttachment && isImage && (
          <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="block mb-1">
            <img 
              src={attachmentUrl} 
              alt={isCN ? "分享的图片" : "Shared image"} 
              className="rounded-lg max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity" 
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </a>
        )}
        {hasAttachment && !isImage && (
          <a 
            href={attachmentUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`flex items-center gap-2 p-2 rounded-lg mb-1 ${isMe ? "bg-primary-foreground/10" : "bg-muted"} hover:opacity-80 transition-opacity`}
          >
            <FileText className="h-4 w-4 shrink-0" />
            <span className="text-xs truncate flex-1">
              {decodeURIComponent(attachmentUrl.split("/").pop() || "") || (isCN ? "文件" : "File")}
            </span>
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        )}

        {/* Text */}
        {textContent && (
          <p className="text-sm whitespace-pre-wrap">{textContent}</p>
        )}
        <p className={`text-xs mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
          {formatTime(message.created_at, i18n.language, { hour: "numeric", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}
