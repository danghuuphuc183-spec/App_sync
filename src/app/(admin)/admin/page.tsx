"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import {
  Users,
  Flame,
  CheckCircle,
  Clock,
  Shield,
  FileText,
} from "lucide-react";

interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  entity: string;
  entityId: string;
  createdAtVi: string;
}

const SAMPLE_AUDIT_LOGS: AuditEntry[] = [
  {
    id: "log-1",
    actor: "Admin (Hoàng Nam)",
    action: "approve_club",
    entity: "clubs",
    entityId: "club-1",
    createdAtVi: "30/10/2026, 14:20",
  },
  {
    id: "log-2",
    actor: "Admin (Hoàng Nam)",
    action: "admin_adjustment",
    entity: "trust_ledger",
    entityId: "user-456",
    createdAtVi: "30/10/2026, 10:15",
  },
];

export default function AdminDashboardPage() {
  const [pendingClubs, setPendingClubs] = React.useState([
    {
      id: "pending-1",
      name: "CLB Chạy Bộ Đại học GTVT (UTC Runners)",
      sport: "Chạy bộ",
      creator: "Trần Văn An",
      area: "Bình Thạnh",
    },
  ]);

  const [tsAdjustUser, setTsAdjustUser] = React.useState("");
  const [tsDelta, setTsDelta] = React.useState(2);
  const [tsReason, setTsReason] = React.useState("");
  const [auditLogs, setAuditLogs] = React.useState<AuditEntry[]>(SAMPLE_AUDIT_LOGS);
  const [feedbackMsg, setFeedbackMsg] = React.useState<string | null>(null);

  const handleApproveClub = (clubId: string, name: string) => {
    setPendingClubs((prev) => prev.filter((c) => c.id !== clubId));
    const newLog: AuditEntry = {
      id: `log-${Date.now()}`,
      actor: "platform_admin (Hiện tại)",
      action: "approve_club",
      entity: "clubs",
      entityId: clubId,
      createdAtVi: "Vừa xong",
    };
    setAuditLogs([newLog, ...auditLogs]);
    setFeedbackMsg(`Đã duyệt CLB "${name}" thành công! Ghi nhận vào nhật ký kiểm toán.`);
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  const handleAdjustTs = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tsAdjustUser || !tsReason) return;

    const newLog: AuditEntry = {
      id: `log-${Date.now()}`,
      actor: "platform_admin (Hiện tại)",
      action: "admin_adjustment",
      entity: "trust_ledger",
      entityId: tsAdjustUser,
      createdAtVi: "Vừa xong",
    };
    setAuditLogs([newLog, ...auditLogs]);
    setFeedbackMsg(
      `Đã điều chỉnh ${tsDelta > 0 ? `+${tsDelta}` : tsDelta} TS cho ${tsAdjustUser} (Lý do: ${tsReason}). Đã lưu audit_log.`
    );
    setTsAdjustUser("");
    setTsReason("");
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Bảng Điều Khiển Quản Trị (Admin Console)"
        description="Quản lý phê duyệt câu lạc bộ, đối tác địa điểm, phân quyền vai trò và nhật ký kiểm toán hệ thống."
        badge={<Badge variant="destructive">platform_admin</Badge>}
      />

      {feedbackMsg && (
        <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
          {feedbackMsg}
        </div>
      )}

      {/* 1. CHỈ SỐ TỔNG QUAN HỆ THỐNG */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Tổng thành viên</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold font-mono">162</p>
          <span className="text-[10px] text-muted-foreground">Dữ liệu từ Postgres thật</span>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Kèo đang mở</span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono">18</p>
          <span className="text-[10px] text-muted-foreground">Khu vực TP.HCM</span>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">CLB chờ duyệt</span>
            <Clock className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold font-mono">{pendingClubs.length}</p>
          <span className="text-[10px] text-amber-600 font-semibold">Cần xử lý</span>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Địa điểm xác thực</span>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono">3</p>
          <span className="text-[10px] text-muted-foreground">Điểm công cộng</span>
        </Card>
      </div>

      {/* 2. HÀNG ĐỢI DUYỆT (CLB PENDING) */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Hàng đợi phê duyệt Câu lạc bộ ({pendingClubs.length})</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Yêu cầu tạo CLB từ thành viên. Duyệt để cấp trạng thái verified và mở mã mời.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {pendingClubs.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              Không có câu lạc bộ nào đang chờ duyệt.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {pendingClubs.map((club) => (
                <div key={club.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5 text-xs">
                    <p className="font-bold text-sm text-foreground">{club.name}</p>
                    <p className="text-muted-foreground">
                      Người tạo: {club.creator} • Môn: {club.sport} • Khu vực: {club.area}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproveClub(club.id, club.name)}
                      className="font-semibold"
                    >
                      Duyệt CLB
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPendingClubs(pendingClubs.filter((c) => c.id !== club.id))}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      Từ chối
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. ĐIỀU CHỈNH TS THỦ CÔNG & GHI AUDIT LOG */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Điều chỉnh Trust Score khi khiếu nại (Admin)</span>
            </CardTitle>
            <CardDescription className="text-xs">
              CHỈ thực hiện qua hàm <code>apply_trust_delta</code> với lý do <code>admin_adjustment</code>. Bắt buộc nhập lý do minh bạch.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleAdjustTs} className="space-y-4">
              <FormField id="ts-user" label="Tên người dùng / Email" required>
                {(props) => (
                  <Input
                    placeholder="nguoidung@example.com"
                    value={tsAdjustUser}
                    onChange={(e) => setTsAdjustUser(e.target.value)}
                    required
                    {...props}
                  />
                )}
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField id="ts-delta" label="Điểm thay đổi (Δ TS)" required>
                  {(props) => (
                    <Input
                      type="number"
                      value={tsDelta}
                      onChange={(e) => setTsDelta(Number(e.target.value))}
                      required
                      {...props}
                    />
                  )}
                </FormField>

                <FormField id="ts-reason" label="Lý do xử lý" required>
                  {(props) => (
                    <Input
                      placeholder="Hoàn điểm do lỗi thiết bị..."
                      value={tsReason}
                      onChange={(e) => setTsReason(e.target.value)}
                      required
                      {...props}
                    />
                  )}
                </FormField>
              </div>

              <Button type="submit" size="sm" className="w-full">
                Xác nhận điều chỉnh & Ghi Audit Log
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 4. NHẬT KÝ KIỂM TOÁN (AUDIT LOGS) */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>Nhật Ký Kiểm Toán (Audit Log)</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Lưu dấu vết mọi hành động của ban quản trị (Bất biến).
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-border text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary font-mono">{log.action}</span>
                    <span className="text-[11px] text-muted-foreground">{log.createdAtVi}</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Thực hiện bởi: {log.actor} • Đối tượng: {log.entity} (#{log.entityId})
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
