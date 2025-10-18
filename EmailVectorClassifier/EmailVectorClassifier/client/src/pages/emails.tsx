import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { EmailListItem } from "@/components/email-list-item";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EmailWithClassification, Category } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export default function Emails() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedEmail, setSelectedEmail] = useState<EmailWithClassification | null>(null);

  const { data: emails, isLoading: emailsLoading, refetch } = useQuery<EmailWithClassification[]>({
    queryKey: ["/api/emails", { category: selectedCategory, search: searchQuery }],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const refreshMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/emails/sync", {}),
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Đã làm mới danh sách email" });
    },
    onError: (error: any) => {
      toast({ title: "Lỗi làm mới", description: error.message, variant: "destructive" });
    },
  });

  const classifyMutation = useMutation({
    mutationFn: ({ emailId, categoryId, isManual }: { emailId: string; categoryId: string; isManual: boolean }) =>
      apiRequest("POST", `/api/emails/${emailId}/classify`, { categoryId, isManual }),
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories/stats"] });
      toast({ title: "Đã cập nhật phân loại" });
      setSelectedEmail(null);
    },
    onError: (error: any) => {
      toast({ title: "Lỗi phân loại", description: error.message, variant: "destructive" });
    },
  });

  const filteredEmails = emails?.filter((email) => {
    const matchesSearch = !searchQuery || 
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
      email.classification?.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">Emails</h1>
            <p className="text-muted-foreground mt-1">
              Quản lý và phân loại email
            </p>
          </div>
          <Button 
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
            data-testid="button-refresh-emails"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm email..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-email"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]" data-testid="select-category-filter">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Lọc theo danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {emailsLoading ? (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </>
          ) : filteredEmails.length > 0 ? (
            filteredEmails.map((email) => (
              <EmailListItem
                key={email.id}
                email={email}
                onClick={() => setSelectedEmail(email)}
              />
            ))
          ) : (
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
              <div className="text-center">
                <p className="text-lg font-medium">Không tìm thấy email</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Thử đồng bộ Gmail hoặc điều chỉnh bộ lọc
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl pr-8">{selectedEmail?.subject}</DialogTitle>
          </DialogHeader>
          {selectedEmail && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Từ</p>
                    <p className="font-medium">{selectedEmail.from}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Đến</p>
                    <p className="font-medium">{selectedEmail.to}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Thời gian</p>
                  <p className="font-medium">
                    {formatDistanceToNow(new Date(selectedEmail.receivedAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </p>
                </div>
                {selectedEmail.classification && (
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Badge
                      style={{
                        backgroundColor: selectedEmail.classification.category.color + '20',
                        color: selectedEmail.classification.category.color,
                        borderColor: selectedEmail.classification.category.color + '40',
                      }}
                    >
                      {selectedEmail.classification.category.name}
                    </Badge>
                    <span className="text-sm font-mono text-muted-foreground">
                      Độ tin cậy: {(selectedEmail.classification.confidence * 100).toFixed(1)}%
                    </span>
                    {selectedEmail.classification.isManual === 1 && (
                      <Badge variant="secondary">Thủ công</Badge>
                    )}
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Thay đổi phân loại</p>
                  <div className="flex gap-2">
                    <Select
                      value={selectedEmail.classification?.categoryId || ""}
                      onValueChange={(categoryId) => {
                        if (selectedEmail) {
                          classifyMutation.mutate({
                            emailId: selectedEmail.id,
                            categoryId,
                            isManual: true,
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="w-[200px]" data-testid="select-email-category">
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Nội dung</p>
                  <div className="prose prose-sm max-w-none">
                    {selectedEmail.body || selectedEmail.snippet || "Không có nội dung"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
