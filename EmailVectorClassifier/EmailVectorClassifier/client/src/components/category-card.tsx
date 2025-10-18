import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, FolderOpen } from "lucide-react";
import * as Icons from "lucide-react";
import type { CategoryWithStats } from "@shared/schema";

interface CategoryCardProps {
  category: CategoryWithStats;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
}

export function CategoryCard({ category, onEdit, onDelete, onClick }: CategoryCardProps) {
  const IconComponent = (Icons as any)[category.icon] || FolderOpen;
  
  return (
    <Card 
      className={`transition-all ${onClick ? 'cursor-pointer hover-elevate active-elevate-2' : ''}`}
      onClick={onClick}
      data-testid={`category-card-${category.id}`}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="flex h-10 w-10 items-center justify-center rounded-md"
                style={{ backgroundColor: category.color + '20' }}
              >
                <IconComponent className="h-5 w-5" style={{ color: category.color }} />
              </div>
              <div>
                <h3 className="font-semibold text-base" data-testid={`category-name-${category.id}`}>
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
            {(onEdit || onDelete) && (
              <div className="flex gap-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                    data-testid={`button-edit-category-${category.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    data-testid={`button-delete-category-${category.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Emails</span>
              <Badge variant="secondary" data-testid={`category-count-${category.id}`}>
                {category.emailCount}
              </Badge>
            </div>
            <div className="h-1 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full rounded-full transition-all"
                style={{ 
                  width: `${category.percentage}%`,
                  backgroundColor: category.color
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right">
              {category.percentage.toFixed(1)}% of total
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
