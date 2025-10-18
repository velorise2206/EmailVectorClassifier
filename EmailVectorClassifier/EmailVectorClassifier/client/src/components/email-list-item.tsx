import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import type { EmailWithClassification } from "@shared/schema";

interface EmailListItemProps {
  email: EmailWithClassification;
  onClick: () => void;
}

export function EmailListItem({ email, onClick }: EmailListItemProps) {
  const category = email.classification?.category;
  
  return (
    <Card 
      className="p-4 cursor-pointer transition-all hover-elevate active-elevate-2" 
      onClick={onClick}
      data-testid={`email-item-${email.id}`}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-base truncate" data-testid={`email-subject-${email.id}`}>
                {email.subject}
              </h3>
              {category && (
                <Badge 
                  className="shrink-0"
                  style={{ 
                    backgroundColor: category.color + '20',
                    color: category.color,
                    borderColor: category.color + '40'
                  }}
                  data-testid={`email-category-${email.id}`}
                >
                  {category.name}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {email.from}
            </p>
          </div>
          {email.classification && (
            <div className="text-xs font-mono text-muted-foreground shrink-0" data-testid={`email-confidence-${email.id}`}>
              {(email.classification.confidence * 100).toFixed(0)}%
            </div>
          )}
        </div>
        
        {email.snippet && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {email.snippet}
          </p>
        )}
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span data-testid={`email-time-${email.id}`}>
            {formatDistanceToNow(new Date(email.receivedAt), { 
              addSuffix: true,
              locale: vi 
            })}
          </span>
        </div>
      </div>
    </Card>
  );
}
