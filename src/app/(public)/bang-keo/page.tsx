"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FormField } from "@/components/shared/form-field";
import { EmptyState } from "@/components/shared/empty-state";
import { AREAS } from "@/features/sports/quiz.config";
import { UT_CONFIG, formatUt } from "@/features/trust/config";
import { canCreateKeo, keosCreatedToday } from "@/features/trust/ut-rules";
import {
  Flame,
  Clock,
  MapPin,
  Plus,
  Ghost,
  CheckCircle2,
  X,
} from "lucide-react";

interface BountyItem {
  id: string;
  creatorName: string;
  sportSlug: string;
  sportName: string;
  areaId: string;
  areaName: string;
  locationNote: string;
  startsAt: string;
  targetDescription: string;
  isGhostMode: boolean;
  isBeginnerOnly: boolean;
  status: "open" | "matched" | "completed" | "cancelled";
}

const INITIAL_BOUNTIES: BountyItem[] = [
  {
    id: "bounty-1",
    creatorName: "Hải Đăng",
    sportSlug: "chay-bo",
    sportName: "Chạy bộ (Running)",
    areaId: "area-binh-thanh",
    areaName: "Bình Thạnh",
    locationNote: "Khuôn viên Landmark 81 / Bờ kè Thanh Đa",
    startsAt: "05:30 AM • Thứ Tư",
    targetDescription: "Chạy 10km • Pace 5:45 - 6:15",
    isGhostMode: false,
    isBeginnerOnly: false,
    status: "open",
  },
  {
    id: "bounty-2",
    creatorName: "Minh Quân",
    sportSlug: "gym",
    sportName: "Tập kháng lực (Gym)",
    areaId: "area-thu-duc",
    areaName: "Thủ Đức",
    locationNote: "Phòng gym SV Đại học Quốc Gia",
    startsAt: "18:00 PM • Thứ Năm",
    targetDescription: "Tập ngực & tay sau • Cần spotter đỡ tạ",
    isGhostMode: true,
    isBeginnerOnly: true,
    status: "open",
  },
  {
    id: "bounty-3",
    creatorName: "Thùy Trang",
    sportSlug: "chay-bo",
    sportName: "Chạy bộ (Running)",
    areaId: "area-binh-thanh",
    areaName: "Bình Thạnh",
    locationNote: "Bờ kè Hoàng Sa - Trường Sa (Gần Cầu Đỏ)",
    startsAt: "06:00 AM • Thứ Bảy",
    targetDescription: "Chạy nhẹ 5km cho Tân binh • Pace 7:00",
    isGhostMode: false,
    isBeginnerOnly: true,
    status: "open",
  },
];

export default function BountyBoardPage() {
  const [bounties, setBounties] = React.useState<BountyItem[]>(INITIAL_BOUNTIES);
  const [selectedSport, setSelectedSport] = React.useState<string>("all");
  const [selectedArea, setSelectedArea] = React.useState<string>("all");
  const [ghostOnly, setGhostOnly] = React.useState(false);
  const [beginnerOnlyFilter, setBeginnerOnlyFilter] = React.useState(false);

  // Modal tạo kèo
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [newSport, setNewSport] = React.useState("chay-bo");
  const [newArea, setNewArea] = React.useState<string>(AREAS[0]?.id || "");
  const [newLocation, setNewLocation] = React.useState("");
  const [newTime, setNewTime] = React.useState("05:30 AM • Thứ Bảy");
  const [newTarget, setNewTarget] = React.useState("");
  /** UT của bạn (demo) và các kèo đã tạo — hạn mức tính theo ngày lịch 00:00–24:00 */
  const MY_UT = 8.5;
  const [createdAt, setCreatedAt] = React.useState<string[]>([]);
  const quota = canCreateKeo({ ut: MY_UT, createdToday: keosCreatedToday(createdAt), kind: "group" });
  const [newGhost, setNewGhost] = React.useState(false);
  const [newBeginnerOnly, setNewBeginnerOnly] = React.useState(true);

  // Thông báo feedback sau khi nhận kèo
  const [actionMessage, setActionMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const filteredBounties = bounties.filter((b) => {
    if (b.status !== "open") return false;
    if (selectedSport !== "all" && b.sportSlug !== selectedSport) return false;
    if (selectedArea !== "all" && b.areaId !== selectedArea) return false;
    if (ghostOnly && !b.isGhostMode) return false;
    if (beginnerOnlyFilter && !b.isBeginnerOnly) return false;
    return true;
  });

  const handleAcceptBounty = (bounty: BountyItem) => {
    setBounties((prev) =>
      prev.map((item) =>
        item.id === bounty.id ? { ...item, status: "matched" } : item
      )
    );
    setActionMessage({
      type: "success",
      text: `Đã nhận kèo! Hãy có mặt lúc ${bounty.startsAt} tại ${bounty.locationNote}. Đúng hẹn +${formatUt(UT_CONFIG.RECOVERY.ON_TIME)} UT; sau khi chốt, huỷ sớm ${formatUt(UT_CONFIG.PENALTY.CANCEL_EARLY)}, trong 30 phút ${formatUt(UT_CONFIG.PENALTY.CANCEL_LATE)} UT.`,
    });
    setTimeout(() => setActionMessage(null), 6000);
  };

  const handleCreateBounty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quota.ok) {
      setActionMessage({ type: "error", text: quota.reasonVi });
      return;
    }
    const areaObj = AREAS.find((a) => a.id === newArea);
    const newBounty: BountyItem = {
      id: `bounty-${Date.now()}`,
      creatorName: "Bạn (Tôi)",
      sportSlug: newSport,
      sportName: newSport === "chay-bo" ? "Chạy bộ (Running)" : "Tập kháng lực (Gym)",
      areaId: newArea,
      areaName: areaObj ? areaObj.name.split(" ")[0] || "TP.HCM" : "TP.HCM",
      locationNote: newLocation || "Điểm hẹn xác thực công cộng",
      startsAt: newTime,
      targetDescription: newTarget || "Tập luyện đúng cam kết",
      isGhostMode: newGhost,
      isBeginnerOnly: newBeginnerOnly,
      status: "open",
    };

    setBounties([newBounty, ...bounties]);
    setCreatedAt((prev) => [...prev, new Date().toISOString()]);
    setIsCreateOpen(false);
    setActionMessage({
      type: "success",
      text: `Đã đăng kèo. ${canCreateKeo({ ut: MY_UT, createdToday: keosCreatedToday(createdAt) + 1, kind: "group" }).reasonVi}.`,
    });
    setTimeout(() => setActionMessage(null), 6000);
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <PageHeader
        title="Bảng Kèo Thể Thao (Workout Bounty v0)"
        description="Khám phá các buổi tập cần bạn đồng hành. Huỷ hay vắng sau khi chốt kèo sẽ bị trừ Điểm Uy tín (UT)."
        badge={
          <Badge variant="outline" className="text-xs">
            {filteredBounties.length} kèo đang mở
          </Badge>
        }
        actions={
          <div className="flex flex-col items-end gap-1">
            <Button onClick={() => setIsCreateOpen(true)} disabled={!quota.ok} className="font-semibold shadow-sm">
              <Plus className="mr-1.5 h-4 w-4" />
              <span>Tạo kèo mới</span>
            </Button>
            <span className="text-[11px] text-muted-foreground">{quota.reasonVi}</span>
          </div>
        }
      />

      {/* Thông báo thao tác */}
      {actionMessage && (
        <div
          role="status"
          className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-foreground" />
            <span>{actionMessage.text}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActionMessage(null)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* BỘ LỌC KÈO */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Lọc môn */}
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-2.5 text-xs focus:ring-1 focus:ring-primary"
            >
              <option value="all">Tất cả môn thể thao</option>
              <option value="chay-bo">Chạy bộ (Running)</option>
              <option value="gym">Tập kháng lực (Gym)</option>
            </select>

            {/* Lọc khu vực */}
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-2.5 text-xs focus:ring-1 focus:ring-primary"
            >
              <option value="all">Tất cả khu vực</option>
              {AREAS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Switch
              id="filter-ghost"
              checked={ghostOnly}
              onCheckedChange={setGhostOnly}
              label="Ghost Mode"
            />
            <Switch
              id="filter-beginner"
              checked={beginnerOnlyFilter}
              onCheckedChange={setBeginnerOnlyFilter}
              label="Chỉ cho Tân binh"
            />
          </div>
        </div>
      </div>

      {/* DANH SÁCH KÈO */}
      {filteredBounties.length === 0 ? (
        <EmptyState
          title="Không tìm thấy kèo phù hợp"
          description="Hiện chưa có kèo nào khớp với bộ lọc của bạn. Hãy tạo kèo mới để rủ bạn tập cùng!"
          actionLabel="Tạo kèo đầu tiên"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredBounties.map((bounty) => (
            <Card
              key={bounty.id}
              className="hover:border-primary/50 transition-all shadow-sm flex flex-col justify-between"
            >
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-xs font-semibold">
                      {bounty.sportName}
                    </Badge>
                    {bounty.isGhostMode && (
                      <Badge variant="secondary" className="flex items-center gap-1 text-[11px]">
                        <Ghost className="h-3 w-3" />
                        <span>Ghost Mode</span>
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <CardTitle className="text-lg font-bold">{bounty.targetDescription}</CardTitle>
                  <CardDescription className="text-xs flex items-center gap-1 mt-1">
                    <span>Đăng bởi: <strong>{bounty.creatorName}</strong></span>
                    {bounty.isBeginnerOnly && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">• Dành cho Tân binh</span>
                    )}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-2 text-xs text-muted-foreground pb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-foreground shrink-0" />
                  <span>{bounty.startsAt}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-foreground shrink-0" />
                  <span>{bounty.locationNote} ({bounty.areaName})</span>
                </div>
              </CardContent>

              <CardFooter className="pt-0 border-t border-border/60 mt-2 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  Đúng hẹn +{formatUt(UT_CONFIG.RECOVERY.ON_TIME)} UT
                </span>
                <Button size="sm" onClick={() => handleAcceptBounty(bounty)}>
                  <span>Nhận kèo này</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL / DIALOG TẠO KÈO */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground">
                  <Flame className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-bold">Tạo Kèo Thể Thao Mới</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreateOpen(false)}
                className="h-8 w-8 p-0 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateBounty} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Môn thể thao</label>
                  <select
                    value={newSport}
                    onChange={(e) => setNewSport(e.target.value)}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-xs"
                  >
                    <option value="chay-bo">Chạy bộ (Running)</option>
                    <option value="gym">Tập kháng lực (Gym)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">Khu vực</label>
                  <select
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-xs"
                  >
                    {AREAS.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <FormField id="bounty-target" label="Mục tiêu buổi tập" required hint="Ví dụ: Chạy 10km pace 6:00 hoặc Tập chân 4 bài">
                {(props) => (
                  <Input
                    placeholder="Mục tiêu chi tiết"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    required
                    {...props}
                  />
                )}
              </FormField>

              <FormField id="bounty-loc" label="Địa điểm tập trung công cộng" required hint="Ví dụ: Cổng chính Landmark 81 hoặc Phòng gym KTX khu B">
                {(props) => (
                  <Input
                    placeholder="Tên địa điểm / công viên"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    required
                    {...props}
                  />
                )}
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField id="bounty-time" label="Thời gian hẹn" required hint="Tối thiểu cách 2 giờ">
                  {(props) => (
                    <Input
                      placeholder="05:30 AM Thứ Bảy"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      required
                      {...props}
                    />
                  )}
                </FormField>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <Switch
                  id="bounty-ghost-toggle"
                  checked={newGhost}
                  onCheckedChange={setNewGhost}
                  label="Chế độ Hướng nội (Ghost Mode)"
                />
                <Switch
                  id="bounty-beginner-toggle"
                  checked={newBeginnerOnly}
                  onCheckedChange={setNewBeginnerOnly}
                  label={`Dành cho người mới (chỉ nhận người từ ${UT_CONFIG.NEWBIE_GROUP_MIN_UT} UT)`}
                />
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Hủy bỏ
                </Button>
                <Button type="submit" className="font-semibold">
                  Tạo kèo ({quota.remaining}/{quota.limit} hôm nay)
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
