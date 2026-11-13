import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Dumbbell, Sparkles, Trophy, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface SportCardProps {
  id: string;
  slug: string;
  nameVi: string;
  category: "endurance" | "strength" | "mind_body" | "racket_team" | "ball_sport";
  verificationMode: "auto_api" | "qr_only" | "peer_confirm";
  phase: number;
  isActive: boolean;
  descriptionVi?: string;
  className?: string;
}

export function SportCard({
  slug,
  nameVi,
  category,
  verificationMode,
  phase,
  isActive,
  descriptionVi,
  className,
}: SportCardProps) {
  const categoryMeta = {
    endurance: {
      name: "Sức bền",
      icon: <Activity className="h-4 w-4 text-foreground" />,
    },
    strength: {
      name: "Kháng lực",
      icon: <Dumbbell className="h-4 w-4 text-foreground" />,
    },
    mind_body: {
      name: "Thân - Tâm",
      icon: <Sparkles className="h-4 w-4 text-foreground" />,
    },
    racket_team: {
      name: "Vợt & Đội",
      icon: <Trophy className="h-4 w-4 text-foreground" />,
    },
    ball_sport: {
      name: "Bóng đồng đội",
      icon: <Trophy className="h-4 w-4 text-foreground" />,
    },
  }[category];

  const verificationModeVi = {
    auto_api: "Đồng bộ API tự động",
    qr_only: "Quét mã QR tại điểm hẹn",
    peer_confirm: "Đối tác xác nhận",
  }[verificationMode];

  return (
    <Card
      className={cn(
        "flex flex-col justify-between overflow-hidden transition-all duration-200 hover:shadow-md",
        !isActive && "opacity-75 bg-muted/40 border-dashed",
        className
      )}
    >
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="flex items-center gap-1.5 py-0.5 text-xs font-normal">
            {categoryMeta.icon}
            <span>{categoryMeta.name}</span>
          </Badge>

          {isActive ? (
            <Badge variant="success" className="text-[11px] py-0 px-2">
              Phase {phase}
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1 text-[11px] py-0 px-2">
              <Lock className="h-3 w-3" />
              Sắp ra mắt
            </Badge>
          )}
        </div>

        <div>
          <CardTitle className="text-xl font-bold text-foreground">{nameVi}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Xác thực: {verificationModeVi}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="text-sm text-muted-foreground pb-4">
        {descriptionVi ||
          (isActive
            ? "Môn thể thao đang mở cho ghép cặp, tạo khế ước và tích lũy uy tín."
            : "Môn đang trong kế hoạch mở rộng ở các giai đoạn sau.")}
      </CardContent>

      <CardFooter className="pt-0">
        {isActive ? (
          <Button asChild className="w-full justify-between" size="default">
            <Link href={`/mon-the-thao/${slug}`}>
              <span>Chọn môn này</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button disabled variant="outline" className="w-full cursor-not-allowed text-xs" size="default">
            Chưa khả dụng ở MVP
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
