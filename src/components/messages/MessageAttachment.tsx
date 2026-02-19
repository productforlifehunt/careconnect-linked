import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Image as ImageIcon, FileText, X, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface MessageAttachmentProps {
  onAttach: (url: string, type: "image" | "file") => void;
  disabled?: boolean;
}

export function MessageAttachment({ onAttach, disabled }: MessageAttachmentProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [mode, setMode] = useState<"image" | "file" | null>(null);

  const handleSubmitUrl = () => {
    if (!urlInput.trim()) return;
    onAttach(urlInput.trim(), mode || "file");
    setUrlInput("");
    setMode(null);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" disabled={disabled || uploading} className="shrink-0">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        {!mode ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground mb-2">Attach</p>
            <Button variant="outline" className="w-full justify-start gap-2" size="sm" onClick={() => setMode("image")}>
              <ImageIcon className="h-4 w-4 text-primary" /> Image URL
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" size="sm" onClick={() => setMode("file")}>
              <FileText className="h-4 w-4 text-primary" /> File URL
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">
                {mode === "image" ? "Image URL" : "File URL"}
              </p>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setMode(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
            <input
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder={mode === "image" ? "https://example.com/photo.jpg" : "https://example.com/doc.pdf"}
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmitUrl()}
            />
            <Button variant="coral" size="sm" className="w-full" onClick={handleSubmitUrl} disabled={!urlInput.trim()}>
              Attach
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
