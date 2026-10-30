"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { SEED_SPORTS } from "@/features/sports/sports.data";
import { AREAS } from "@/features/sports/quiz.config";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FormField } from "@/components/shared/form-field";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ArrowLeft, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function SportProfilePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const sport = SEED_SPORTS.find((s) => s.slug === slug);

  // Mặc định tài khoản mới là is_rookie: true (theo quyết định D1)
  const [isRookie] = React.useState(true);
  const [selfLevel, setSelfLevel] = React.useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [goal, setGoal] = React.useState("");
  const [selectedArea, setSelectedArea] = React.useState<string>(AREAS[0]?.id || "");
  const [ghostMode, setGhostMode] = React.useState(false);
  const [timeSlot, setTimeSlot] = React.useState("05:30");
  const [isSaved, setIsSaved] = React.useState(false);

  if (!sport) {
    return (
      <div className="container max-w-lg mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Không tìm thấy môn thể thao</h2>
        <Button asChild variant="outline">
          <Link href="/mon-the-thao">Quay lại danh mục</Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-3">
          <Link href="/mon-the-thao">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            <span>Quay lại</span>
          </Link>
        </Button>
        <PageHeader
          title={`Hồ Sơ Môn: ${sport.nameVi}`}
          description="Thiết lập chỉ số năng lực, khu vực và khung giờ tập luyện để tham gia Bảng Kèo."
          badge={<Badge variant="outline">Hồ sơ vận động</Badge>}
        />
      </div>

      {isSaved ? (
        <Card className="border-emerald-500/40 bg-emerald-500/5 shadow-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Hồ sơ đã được lưu thành công!</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Bạn đã sẵn sàng để nhận các kèo thể thao dành cho Tân binh (Beginner Only) và bắt đầu tích lũy Điểm Uy Tín.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button onClick={() => router.push("/bang-keo")} size="lg" className="w-full sm:w-auto">
                <span>Khám phá Bảng Kèo ngay</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setIsSaved(false)} size="lg" className="w-full sm:w-auto">
                Chỉnh sửa lại hồ sơ
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cảnh báo Rookie Lock */}
          {isRookie && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs flex items-start gap-3 text-amber-900 dark:text-amber-200">
              <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Trạng thái Tân binh (Quyết định D1)</p>
                <p className="leading-relaxed">
                  Vì bạn là thành viên mới, cấp độ tự khai được <strong>khóa ở mức Mới bắt đầu (Beginner)</strong> nhằm bảo vệ an toàn cho bạn và bạn tập. Bạn chỉ có thể nhận các kèo gắn nhãn <em>Beginner Only</em> cho đến khi tích lũy đủ buổi tập hoặc xác thực đường cơ sở.
                </p>
              </div>
            </div>
          )}

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Thông tin năng lực & lịch tập</CardTitle>
              <CardDescription className="text-xs">
                Dữ liệu này được đối soát để ghép bạn tập tương đồng nhất.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Trình độ (Self Level) */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Trình độ của bạn</label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelfLevel("beginner")}
                    className={cn(
                      "p-3 rounded-lg border text-xs font-semibold text-center select-none transition-all flex flex-col items-center gap-1",
                      selfLevel === "beginner"
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                        : "border-border hover:bg-muted"
                    )}
                  >
                    <span>Mới bắt đầu</span>
                    <span className="text-[10px] font-normal text-muted-foreground">Beginner</span>
                  </button>

                  <button
                    type="button"
                    disabled={isRookie}
                    onClick={() => setSelfLevel("intermediate")}
                    className={cn(
                      "p-3 rounded-lg border text-xs font-semibold text-center select-none transition-all flex flex-col items-center gap-1 relative",
                      selfLevel === "intermediate"
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                        : "border-border hover:bg-muted",
                      isRookie && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isRookie && <Lock className="absolute top-1.5 right-1.5 h-3 w-3 text-muted-foreground" />}
                    <span>Trung bình</span>
                    <span className="text-[10px] font-normal text-muted-foreground">Intermediate</span>
                  </button>

                  <button
                    type="button"
                    disabled={isRookie}
                    onClick={() => setSelfLevel("advanced")}
                    className={cn(
                      "p-3 rounded-lg border text-xs font-semibold text-center select-none transition-all flex flex-col items-center gap-1 relative",
                      selfLevel === "advanced"
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                        : "border-border hover:bg-muted",
                      isRookie && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isRookie && <Lock className="absolute top-1.5 right-1.5 h-3 w-3 text-muted-foreground" />}
                    <span>Nâng cao</span>
                    <span className="text-[10px] font-normal text-muted-foreground">Advanced</span>
                  </button>
                </div>
              </div>

              {/* Mục tiêu cụ thể */}
              <FormField id="sport-goal" label="Mục tiêu cụ thể" hint="Ví dụ: Chạy 5km sub 30 phút hoặc Squat 60kg">
                {(props) => (
                  <Input
                    placeholder="Mục tiêu bạn hướng đến trong tháng này"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    {...props}
                  />
                )}
              </FormField>

              {/* Khu vực thường tập */}
              <div className="space-y-1.5">
                <label htmlFor="sport-area" className="text-sm font-medium">Khu vực thường tập</label>
                <select
                  id="sport-area"
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
                >
                  {AREAS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">Chỉ hiển thị kèo và bạn tập quanh khu vực này</p>
              </div>

              {/* Giờ thường tập */}
              <FormField id="sport-time" label="Khung giờ tập thường lệ" hint="Giờ bạn có thể có mặt tại điểm hẹn">
                {(props) => (
                  <Input
                    type="time"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    {...props}
                  />
                )}
              </FormField>

              {/* Ghost Mode Switch */}
              <div className="pt-2 border-t border-border">
                <Switch
                  id="profile-ghost-mode"
                  checked={ghostMode}
                  onCheckedChange={setGhostMode}
                  label="Mặc định bật Chế độ Hướng nội (Ghost Mode) khi tạo kèo"
                />
                <p className="text-xs text-muted-foreground mt-1 pl-14">
                  Phòng chat tự do sẽ bị khóa, chỉ sử dụng tin nhắn nhanh và quét mã QR điểm danh.
                </p>
              </div>
            </CardContent>

            <CardFooter className="pt-4 border-t border-border flex justify-end">
              <Button type="submit" size="lg" className="w-full sm:w-auto font-semibold">
                Lưu hồ sơ môn & Hoàn tất
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
}
