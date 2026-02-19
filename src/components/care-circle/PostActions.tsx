import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Pin, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye } from "lucide-react";

export function PostActions({
  post, userId, isAdmin,
  onEdit, onTogglePin, onDelete,
}: {
  post: any; userId: string | undefined; isAdmin: boolean;
  onEdit: (post: any) => void; onTogglePin: (post: any) => void; onDelete: (id: string) => void;
}) {
  const canEdit = post.author_id === userId;
  const canPin = isAdmin && post.type === "announcement";
  const canDelete = post.author_id === userId || isAdmin;
  if (!canEdit && !canPin && !canDelete) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-3.5 w-3.5" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canEdit && <DropdownMenuItem onClick={() => onEdit(post)}><Edit className="h-3.5 w-3.5 mr-2" /> Edit</DropdownMenuItem>}
        {canPin && <DropdownMenuItem onClick={() => onTogglePin(post)}><Pin className="h-3.5 w-3.5 mr-2" /> {post.is_pinned ? "Unpin" : "Pin"}</DropdownMenuItem>}
        {canDelete && <DropdownMenuItem className="text-destructive" onClick={() => onDelete(post.id)}><Trash2 className="h-3.5 w-3.5 mr-2" /> Delete</DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function VisibilitySelect({ value, onChange, memberCategories }: { value: string; onChange: (v: string) => void; memberCategories?: any[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-36">
        <Eye className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="group">All Members</SelectItem>
        <SelectItem value="admins">Admins Only</SelectItem>
        {(memberCategories || []).length > 0 && <SelectItem value="categories">By Category</SelectItem>}
      </SelectContent>
    </Select>
  );
}
