"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar } from "@/components/ui/avatar";
import { PageHeader } from "@/components/shared/page-header";
import { TierBadge } from "@/components/shared/tier-badge";
import { TrustMeter } from "@/components/shared/trust-meter";
import { SportCard } from "@/components/shared/sport-card";
import { Stepper } from "@/components/shared/stepper";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { FormField } from "@/components/shared/form-field";

export default function DesignSystemPage() {
  const [switchChecked, setSwitchChecked] = React.useState(false);
  const [checkboxChecked, setCheckboxChecked] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(1);

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-12">
      <PageHeader
        title="Design System & Component Showcase"
        description="Môi trường kiểm tra toàn bộ design tokens, components, các trạng thái tương tác và chuẩn tiếp cận WCAG 4.5:1."
        badge={<Badge variant="outline">Dev Only</Badge>}
      />

      {/* 1. MÀU SẮC & HẠNG THỂ THAO */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold border-b pb-2">1. Design Tokens & 4 Hạng Thể Thao</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-tier-bronze text-tier-bronze-foreground shadow-sm">
            <p className="font-bold text-sm">Hạng Đồng</p>
            <p className="text-xs opacity-90">&lt; 60 TS</p>
          </div>
          <div className="p-4 rounded-xl bg-tier-silver text-tier-silver-foreground shadow-sm">
            <p className="font-bold text-sm">Hạng Bạc</p>
            <p className="text-xs opacity-90">60 - 99 TS</p>
          </div>
          <div className="p-4 rounded-xl bg-tier-gold text-tier-gold-foreground shadow-sm">
            <p className="font-bold text-sm">Hạng Vàng</p>
            <p className="text-xs opacity-90">100 - 129 TS</p>
          </div>
          <div className="p-4 rounded-xl bg-tier-diamond text-tier-diamond-foreground shadow-sm">
            <p className="font-bold text-sm">Hạng Kim Cương</p>
            <p className="text-xs opacity-90">130 - 150 TS</p>
          </div>
        </div>
      </section>

      {/* 2. BUTTONS & TRẠNG THÁI */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold border-b pb-2">2. Buttons (Touch Target &gt;= 44px)</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="tier">Tier Gold</Button>
          <Button isLoading>Loading State</Button>
          <Button disabled>Disabled State</Button>
        </div>
      </section>

      {/* 3. TIER BADGE KIỂM TRA BIÊN */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold border-b pb-2">3. Tier Badges (Biên 59, 60, 99, 100, 129, 130, 150)</h2>
        <div className="flex flex-wrap items-center gap-3">
          <TierBadge score={45} showScore />
          <TierBadge score={59} showScore />
          <TierBadge score={60} showScore />
          <TierBadge score={99} showScore />
          <TierBadge score={100} showScore />
          <TierBadge score={129} showScore />
          <TierBadge score={130} showScore />
          <TierBadge score={150} showScore />
        </div>
      </section>

      {/* 4. TRUST METER */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold border-b pb-2">4. Trust Meter Visualizer (0 - 150 TS)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TrustMeter currentScore={100} heldScore={20} />
          <TrustMeter currentScore={55} heldScore={0} />
        </div>
      </section>

      {/* 5. FORM INPUTS & ACCESSIBILITY */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold border-b pb-2">5. Form Fields (aria-describedby & aria-invalid)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField id="demo-name" label="Tên hiển thị" hint="Tên bạn tập nhìn thấy">
            {(fieldProps) => <Input placeholder="Ví dụ: Hoàng Nam" {...fieldProps} />}
          </FormField>

          <FormField
            id="demo-email"
            label="Địa chỉ Email"
            required
            error="Email không hợp lệ hoặc thiếu ký tự @"
          >
            {(fieldProps) => <Input type="email" defaultValue="sai-email" {...fieldProps} />}
          </FormField>

          <FormField id="demo-note" label="Ghi chú buổi tập" hint="Tối đa 200 ký tự">
            {(fieldProps) => <Textarea placeholder="Mang theo dây nhảy..." {...fieldProps} />}
          </FormField>

          <div className="space-y-3 pt-2">
            <Switch
              id="ghost-switch"
              checked={switchChecked}
              onCheckedChange={setSwitchChecked}
              label="Bật chế độ Hướng nội (Ghost Mode)"
            />

            <Checkbox
              id="terms-check"
              checked={checkboxChecked}
              onCheckedChange={setCheckboxChecked}
              label="Tôi cam kết tham gia đúng giờ và đủ bài tập"
            />
          </div>
        </div>
      </section>

      {/* 6. STEPPER */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold border-b pb-2">6. Stepper (Quiz / Onboarding)</h2>
        <Stepper
          steps={[
            { title: "Mục tiêu" },
            { title: "Thời gian & Khu vực" },
            { title: "Trình độ" },
            { title: "Hoàn tất" },
          ]}
          currentStep={currentStep}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            disabled={currentStep === 0}
          >
            Quay lại bước
          </Button>
          <Button
            size="sm"
            onClick={() => setCurrentStep((s) => Math.min(3, s + 1))}
            disabled={currentStep === 3}
          >
            Tiếp theo
          </Button>
        </div>
      </section>

      {/* 7. SPORT CARDS */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold border-b pb-2">7. Sport Cards (Active & Coming Soon)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SportCard
            id="sp-1"
            slug="chay-bo"
            nameVi="Chạy bộ đường dài"
            category="endurance"
            verificationMode="auto_api"
            phase={1}
            isActive={true}
          />
          <SportCard
            id="sp-2"
            slug="dap-xe"
            nameVi="Đạp xe đường trường"
            category="endurance"
            verificationMode="qr_only"
            phase={2}
            isActive={false}
          />
        </div>
      </section>

      {/* 8. CÁC TRẠNG THÁI DỮ LIỆU BẮT BUỘC (QUY TẮC 20) */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold border-b pb-2">8. Bốn trạng thái dữ liệu (Loading, Empty, Error, Success)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LoadingState message="Đang tải danh sách bạn tập..." />
          <EmptyState
            title="Chưa có kèo nào"
            description="Hãy là người đầu tiên tạo thẻ lịch tập quanh khu vực của bạn."
            actionLabel="Tạo kèo ngay"
            onAction={() => alert("Tạo kèo")}
          />
          <ErrorState
            title="Lỗi tải dữ liệu"
            message="Không thể kết nối tới cơ sở dữ liệu."
            onRetry={() => alert("Thử lại")}
          />
        </div>
      </section>

      {/* 9. THÀNH PHẦN BỔ SỢ: CARD, PROGRESS, SKELETON, AVATAR */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold border-b pb-2">9. Card, Progress, Skeleton & Avatar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar fallback="HL" size="md" />
                <div>
                  <CardTitle>Hoàng Long (Pacer)</CardTitle>
                  <CardDescription>CLB Chạy Bộ Thủ Đức</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Tiến độ hoàn thành tuần</span>
                  <span>75%</span>
                </div>
                <Progress value={75} max={100} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skeleton Loading Preview</CardTitle>
              <CardDescription>Mô phỏng trạng thái tải khung thẻ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-1/3 rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
