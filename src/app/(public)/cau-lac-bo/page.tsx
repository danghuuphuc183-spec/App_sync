"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, ShieldCheck, Key, ArrowRight, CheckCircle2 } from "lucide-react";

interface ClubItem {
  id: string;
  name: string;
  sportName: string;
  memberCount: number;
  description: string;
  areaName: string;
  isVerified: boolean;
}

const SAMPLE_CLUBS: ClubItem[] = [
  {
    id: "club-1",
    name: "CLB Chạy Bộ Sinh Viên Ngoại Thương (FTU2 Runners)",
    sportName: "Chạy bộ",
    memberCount: 68,
    description: "Cộng đồng chạy bộ rèn luyện sức bền sáng sớm quanh khu vực Bình Thạnh và bờ kè Thanh Đa.",
    areaName: "Bình Thạnh",
    isVerified: true,
  },
  {
    id: "club-2",
    name: "Đội Kháng Lực ĐHQG Thủ Đức (VNU Calisthenics & Gym)",
    sportName: "Tập kháng lực",
    memberCount: 94,
    description: "Nhóm tập luyện chia sẻ giáo án, spotter đỡ tạ và khế ước tập gym đều đặn 4 buổi/tuần.",
    areaName: "Thủ Đức",
    isVerified: true,
  },
];

export default function ClubsPage() {
  const [inviteCode, setInviteCode] = React.useState("");
  const [joinMessage, setJoinMessage] = React.useState<string | null>(null);

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode) return;
    setJoinMessage(`Đã tham gia câu lạc bộ thành công với mã "${inviteCode}"!`);
    setInviteCode("");
    setTimeout(() => setJoinMessage(null), 5000);
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <PageHeader
        title="Câu Lạc Bộ Thể Thao (Club OS)"
        description="Không gian sinh hoạt nội bộ cho các đội nhóm sinh viên và CLB phong trào. Quản lý điểm danh tự động và thử thách chung."
        badge={<Badge variant="outline">Mô hình B2B2C</Badge>}
      />

      {/* Tham gia bằng mã mời */}
      <Card className="border-primary/30 bg-primary/5 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" />
                <span>Bạn có mã mời tham gia CLB kín?</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Nhập mã mời do Ban chủ nhiệm CLB cấp để mở khóa Private Hub nội bộ.
              </p>
            </div>

            <form onSubmit={handleJoinByCode} className="flex items-center gap-2 w-full md:w-auto">
              <Input
                placeholder="Nhập mã mời (vd: FTU2RUN)"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="h-10 text-xs uppercase font-mono max-w-[200px]"
                required
              />
              <Button type="submit" size="sm" className="font-semibold shrink-0">
                <span>Tham gia</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </form>
          </div>

          {joinMessage && (
            <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{joinMessage}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danh bạ CLB đã xác minh */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h2 className="text-lg font-bold">Câu Lạc Bộ Đã Xác Thực</h2>
          <span className="text-xs text-muted-foreground">{SAMPLE_CLUBS.length} CLB hoạt động</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SAMPLE_CLUBS.map((club) => (
            <Card key={club.id} className="hover:border-primary/50 transition-all shadow-sm">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {club.sportName} • {club.areaName}
                  </Badge>
                  {club.isVerified && (
                    <Badge variant="success" className="text-[10px] flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Đã xác thực
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg font-bold leading-snug">{club.name}</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  {club.description}
                </CardDescription>
              </CardHeader>

              <CardFooter className="pt-2 border-t border-border/70 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{club.memberCount} thành viên</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => alert(`Xem chi tiết ${club.name}`)}>
                  Xem CLB
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
