import { useQuery, useMutation } from "@tanstack/react-query";
import { StatsCard } from "@/components/stats-card";
import { CategoryCard } from "@/components/category-card";
import { Mail, FolderOpen, TrendingUp, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { CategoryWithStats } from "@shared/schema";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalEmails: number;
    categorizedEmails: number;
    totalCategories: number;
    averageConfidence: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<CategoryWithStats[]>({
    queryKey: ["/api/categories/stats"],
  });

  const syncMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/emails/sync", {}),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/emails"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories/stats"] });
      toast({ 
        title: "Đồng bộ thành công", 
        description: `Đã đồng bộ ${data.new} email mới từ ${data.total} email` 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Lỗi đồng bộ", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const chartData = categories?.map(cat => ({
    name: cat.name,
    value: cat.emailCount,
    color: cat.color,
  })) || [];

  if (statsLoading || categoriesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Tổng quan hệ thống phân loại email
          </p>
        </div>
        <Button 
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          data-testid="button-sync-emails"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
          {syncMutation.isPending ? "Đang đồng bộ..." : "Đồng bộ Gmail"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Tổng số Email"
          value={stats?.totalEmails || 0}
          icon={Mail}
          testId="stat-total-emails"
        />
        <StatsCard
          title="Đã phân loại"
          value={stats?.categorizedEmails || 0}
          icon={FolderOpen}
          testId="stat-categorized-emails"
        />
        <StatsCard
          title="Danh mục"
          value={stats?.totalCategories || 0}
          icon={TrendingUp}
          testId="stat-total-categories"
        />
        <StatsCard
          title="Độ tin cậy TB"
          value={`${((stats?.averageConfidence || 0) * 100).toFixed(1)}%`}
          icon={Zap}
          testId="stat-avg-confidence"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Phân bố Email theo Danh mục</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Chưa có dữ liệu phân loại
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danh mục</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <div 
                    key={category.id}
                    className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {category.emailCount} emails
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {category.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                  Chưa có danh mục nào
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
