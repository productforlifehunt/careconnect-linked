import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tag, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { SubgroupCard } from "../SubgroupCard";

interface MemberGroupsTabProps {
  members: any[];
  memberCategories: any[];
  activeGroupId: string | null;
  userId: string | undefined;
  isAdmin: boolean;
  createCategory: any;
  deleteCategory: any;
}

export function MemberGroupsTab({
  members, memberCategories, activeGroupId, userId, isAdmin, createCategory, deleteCategory,
}: MemberGroupsTabProps) {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);

  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("");

  const handleAddCategory = () => {
    if (!newCategoryName.trim() || !activeGroupId) return;
    createCategory.mutate({ groupId: activeGroupId, name: newCategoryName, description: newCategoryDesc || undefined, color: newCategoryColor || undefined }, {
      onSuccess: () => {
        setNewCategoryName(""); setNewCategoryDesc(""); setNewCategoryColor(""); setAddCategoryOpen(false);
        toast({ title: Z("子群组已创建！", "Member group created!") });
      },
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Tag className="h-4 w-4" /> {Z("子群组", "Member Groups")}</h3>
        <Dialog open={addCategoryOpen} onOpenChange={setAddCategoryOpen}>
          {isAdmin && <DialogTrigger asChild><Button variant="outline" size="sm"><Plus className="h-3.5 w-3.5 mr-1" /> {Z("添加", "Add")}</Button></DialogTrigger>}
          <DialogContent>
            <DialogHeader><DialogTitle>{Z("创建子群组", "Create Member Group")}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label>{Z("名称 *", "Name *")}</Label><Input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder={Z("例如：医疗团队、夜班", "e.g. Medical Team, Night Shift")} /></div>
              <div><Label>{Z("描述", "Description")}</Label><Input value={newCategoryDesc} onChange={e => setNewCategoryDesc(e.target.value)} placeholder={Z("可选的描述", "Optional description")} /></div>
              <div><Label>{Z("颜色", "Color")}</Label>
                <Select value={newCategoryColor} onValueChange={setNewCategoryColor}>
                  <SelectTrigger><SelectValue placeholder={Z("选择颜色", "Choose a color")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">{Z("蓝色", "Blue")}</SelectItem><SelectItem value="green">{Z("绿色", "Green")}</SelectItem>
                    <SelectItem value="red">{Z("红色", "Red")}</SelectItem><SelectItem value="purple">{Z("紫色", "Purple")}</SelectItem>
                    <SelectItem value="orange">{Z("橙色", "Orange")}</SelectItem><SelectItem value="teal">{Z("青色", "Teal")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="coral" className="w-full" onClick={handleAddCategory} disabled={!newCategoryName.trim() || createCategory.isPending}>{Z("创建子群组", "Create Member Group")}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {(memberCategories || []).length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-2">
          {(memberCategories || []).map((cat: any) => (
            <SubgroupCard
              key={cat.id}
              subgroup={cat}
              members={members || []}
              isAdmin={isAdmin}
              onDelete={() => deleteCategory.mutate(cat.id)}
              currentUserId={userId}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">{Z("还没有子群组。建议创建「家人」「医疗团队」或「夜班」等子群组——之后帖子和任务可限定给特定子群组。", 'No member groups yet. Create groups like "Family", "Medical Team", or "Night Shift" — posts and tasks can then be limited to specific member groups.')}</p>
      )}
    </div>
  );
}
