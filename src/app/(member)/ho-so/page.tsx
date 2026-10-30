"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { TierBadge } from "@/components/shared/tier-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { ShieldCheck, Download, Trash2, ShieldAlert } from "lucide-react";

export default function ProfilePage() {
  const [displayName, setDisplayName] = React.useState("Hoàng Nam");
  const [isRookie] = React.useState(true);

  return (
    <div className="space-y-8 max-w-3xl">
      <PageHeader
        title="Hồ Sơ Thành Viên"
        description="Quản lý thông tin cá nhân, hạng uy tín và quyền riêng tư theo Luật Bảo vệ dữ liệu cá nhân 2026."
      />

      {/* Thông tin chung */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 pb-4">
          <Avatar fallback="HN" size="lg" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-bold">{displayName}</CardTitle>
              <TierBadge score={102} showScore />
            </div>
            <div className="flex items-center gap-2">
              <CardDescription className="text-xs">
                Thành viên gia nhập tháng 10/2026
              </CardDescription>
              {isRookie && (
                <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/40">
                  Tân binh (Rookie)
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          <FormField id="profile-name" label="Tên hiển thị công khai">
            {(props) => (
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                {...props}
              />
            )}
          </FormField>

          {isRookie && (
            <div className="rounded-xl border border-border p-3.5 bg-muted/40 text-xs text-muted-foreground flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p>
                Trạng thái <strong>Tân binh (Rookie)</strong> giúp bạn làm quen với khế ước buổi tập. Bạn chỉ nhận các kèo mức độ cơ bản cho đến khi hoàn thành tối thiểu 3 buổi tập thực tế.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t border-border pt-4 flex justify-end">
          <Button size="sm">Lưu cập nhật</Button>
        </CardFooter>
      </Card>

      {/* TRUNG TÂM QUYỀN RIÊNG TƯ & DỮ LIỆU CÁ NHÂN (P12) */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <ShieldCheck className="h-4 w-4" />
            <span>Trung tâm Quyền riêng tư (Privacy Center)</span>
          </div>
          <CardTitle className="text-base font-bold">Quản trị dữ liệu của bạn</CardTitle>
          <CardDescription className="text-xs">
            Tuân thủ Luật Bảo vệ dữ liệu cá nhân và Nghị định 356/2025/NĐ-CP: Thu thập tối thiểu, minh bạch mục đích và trao quyền kiểm soát cho người dùng.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl border border-border bg-muted/20 gap-3">
            <div>
              <p className="text-sm font-semibold">Xuất toàn bộ dữ liệu cá nhân (JSON)</p>
              <p className="text-xs text-muted-foreground">
                Tải về bản sao lưu gồm hồ sơ, quiz, lịch sử sổ cái TS và các kèo đã tham gia.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert("Đang trích xuất dữ liệu của bạn dạng JSON...")}
              className="shrink-0"
            >
              <Download className="mr-1.5 h-4 w-4" />
              <span>Xuất dữ liệu</span>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl border border-destructive/20 bg-destructive/5 gap-3">
            <div>
              <p className="text-sm font-semibold text-destructive">Yêu cầu xóa tài khoản</p>
              <p className="text-xs text-muted-foreground">
                Ẩn danh hóa thông tin cá nhân và xóa mềm tài khoản sau thời gian chờ 7 ngày.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert("Yêu cầu xóa tài khoản đã được ghi nhận với thời gian chờ 7 ngày.")}
              className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              <span>Xóa tài khoản</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
