import * as React from "react";
import { SEED_SPORTS } from "@/features/sports/sports.data";
import { SportCard } from "@/components/shared/sport-card";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";
import Link from "next/link";

export default function SportsCatalogPage() {
  const activeSports = SEED_SPORTS.filter((s) => s.isActive);
  const upcomingSports = SEED_SPORTS.filter((s) => !s.isActive);

  return (
    <div className="container max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      <PageHeader
        title="Danh Mục Môn Thể Thao"
        description="Khám phá các môn thể thao có sẵn cho ghép cặp kỷ luật và khế ước buổi tập tại TP.HCM."
        badge={
          <Badge variant="outline" className="text-xs">
            {activeSports.length} môn đang mở
          </Badge>
        }
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/chon-mon/goi-y">
              <Compass className="mr-2 h-4 w-4 text-emerald-600" />
              <span>Chưa biết chọn môn nào? Làm Quiz</span>
            </Link>
          </Button>
        }
      />

      {/* Môn mở ở MVP (Phase 1) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border/70 pb-2">
          <Badge variant="success">Phase 1</Badge>
          <h2 className="text-lg font-bold">Môn Đang Hoạt Động (Mở Kèo Ngay)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {activeSports.map((sport) => (
            <SportCard
              key={sport.id}
              id={sport.id}
              slug={sport.slug}
              nameVi={sport.nameVi}
              category={sport.category}
              verificationMode={sport.verificationMode}
              phase={sport.phase}
              isActive={sport.isActive}
              descriptionVi={sport.descriptionVi}
            />
          ))}
        </div>
      </section>

      {/* Môn đang chuẩn bị (Phase 2 & 3) */}
      <section className="space-y-4 pt-6">
        <div className="flex items-center gap-2 border-b border-border/70 pb-2">
          <Badge variant="secondary">Kế hoạch mở rộng</Badge>
          <h2 className="text-lg font-bold text-muted-foreground">Môn Sắp Ra Mắt</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingSports.map((sport) => (
            <SportCard
              key={sport.id}
              id={sport.id}
              slug={sport.slug}
              nameVi={sport.nameVi}
              category={sport.category}
              verificationMode={sport.verificationMode}
              phase={sport.phase}
              isActive={sport.isActive}
              descriptionVi={sport.descriptionVi}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
