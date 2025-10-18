import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RefreshCw, Database, Zap } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Settings() {
  const [autoClassify, setAutoClassify] = useState(true);
  const [syncOnStart, setSyncOnStart] = useState(false);
  const { toast } = useToast();

  const syncMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/emails/sync", {}),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/emails"] });
      toast({ 
        title: "Đồng bộ Gmail hoàn tất", 
        description: `Đã đồng bộ ${data.new} email mới` 
      });
    },
    onError: (error: any) => {
      toast({ title: "Lỗi đồng bộ", description: error.message, variant: "destructive" });
    },
  });

  const embeddingsMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/emails/compute-embeddings", {}),
    onSuccess: (data: any) => {
      toast({ 
        title: "Hoàn tất tính toán", 
        description: `Đã xử lý ${data.processed} email` 
      });
    },
    onError: (error: any) => {
      toast({ title: "Lỗi tính toán", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Cấu hình hệ thống phân loại email
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Tự động hóa
            </CardTitle>
            <CardDescription>
              Cấu hình các tính năng tự động
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-classify">Phân loại tự động</Label>
                <p className="text-sm text-muted-foreground">
                  Tự động phân loại email mới
                </p>
              </div>
              <Switch
                id="auto-classify"
                checked={autoClassify}
                onCheckedChange={setAutoClassify}
                data-testid="switch-auto-classify"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sync-start">Đồng bộ khi khởi động</Label>
                <p className="text-sm text-muted-foreground">
                  Tự động đồng bộ khi mở ứng dụng
                </p>
              </div>
              <Switch
                id="sync-start"
                checked={syncOnStart}
                onCheckedChange={setSyncOnStart}
                data-testid="switch-sync-start"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Dữ liệu
            </CardTitle>
            <CardDescription>
              Quản lý dữ liệu và đồng bộ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              data-testid="button-sync-gmail"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
              {syncMutation.isPending ? "Đang đồng bộ..." : "Đồng bộ Gmail ngay"}
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => embeddingsMutation.mutate()}
              disabled={embeddingsMutation.isPending}
              data-testid="button-recompute-embeddings"
            >
              <Zap className={`h-4 w-4 mr-2 ${embeddingsMutation.isPending ? 'animate-spin' : ''}`} />
              {embeddingsMutation.isPending ? "Đang tính toán..." : "Tính lại Vector Embeddings"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin hệ thống</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Gmail kết nối</span>
            <span className="font-medium text-chart-3">✓ Đã kết nối</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">OpenAI API</span>
            <span className="font-medium text-chart-3">✓ Hoạt động</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Database</span>
            <span className="font-medium text-chart-3">✓ PostgreSQL</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Model</span>
            <span className="font-medium font-mono">text-embedding-3-small</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
