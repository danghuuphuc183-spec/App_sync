import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, CheckCircle2, ArrowRight } from "lucide-react";

export default function ChooseSportGatewayPage() {
  return (
    <div className="container max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="text-center space-y-2">
        <PageHeader
          title="Chọn Môn Thể Thao Tập Luyện"
          description="Chọn lối đi phù hợp nhất với bạn để bắt đầu xây dựng hồ sơ vận động và khế ước kỷ luật."
          className="border-b-0 text-center pb-2 items-center"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Lối 1: Đã biết môn */}
        <Card className="hover:border-primary/50 transition-all shadow-sm flex flex-col justify-between">
          <CardHeader className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CheckCircle2 className="h-6 w-6 stroke-[2]" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Tôi đã biết môn mình muốn</CardTitle>
              <CardDescription className="text-xs mt-1">
                Xem trực tiếp danh mục môn (Chạy bộ hoặc Gym) và bắt đầu thiết lập hồ sơ tập luyện ngay.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            <Button asChild className="w-full justify-between" size="lg">
              <Link href="/mon-the-thao">
                <span>Xem danh mục môn</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Lối 2: Làm Quiz gợi ý */}
        <Card className="hover:border-primary/50 transition-all shadow-sm flex flex-col justify-between border-primary/30 bg-primary/5">
          <CardHeader className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Compass className="h-6 w-6 stroke-[2]" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Gợi ý giúp tôi (Quiz 7 câu)</CardTitle>
              <CardDescription className="text-xs mt-1">
                Trả lời nhanh 7 câu hỏi về mục tiêu, thời gian, tính cách và ngân sách để thuật toán gợi ý môn phù hợp nhất.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            <Button asChild variant="outline" className="w-full justify-between border-primary/40 hover:bg-primary/10" size="lg">
              <Link href="/chon-mon/goi-y">
                <span>Làm Quiz gợi ý môn</span>
                <ArrowRight className="h-4 w-4 text-primary" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
