"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { Mail, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSent, setIsSent] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 600);
  };

  return (
    <Card className="shadow-lg border-border">
      <CardHeader className="text-center space-y-1">
        <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="h-6 w-6 stroke-[2]" />
        </div>
        <CardTitle className="text-2xl font-bold">Đăng nhập tài khoản</CardTitle>
        <CardDescription className="text-xs">
          Nhập email của bạn để nhận mã OTP hoặc liên kết đăng nhập nhanh
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isSent ? (
          <div className="text-center space-y-4 py-4" role="status">
            <div className="rounded-xl bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
              Đã gửi mã xác nhận đến <strong>{email}</strong>. Vui lòng kiểm tra hộp thư!
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsSent(false)}>
              Nhập email khác
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField id="login-email" label="Địa chỉ Email" required hint="Dùng email sinh viên hoặc cá nhân thường dùng">
              {(fieldProps) => (
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="ban@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    {...fieldProps}
                  />
                </div>
              )}
            </FormField>

            <Button type="submit" className="w-full font-semibold" isLoading={isLoading}>
              <span>Tiếp tục</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border pt-4 text-xs text-muted-foreground">
        <span>Chưa có tài khoản? </span>
        <Link href="/dang-nhap" className="ml-1 font-semibold text-primary hover:underline">
          Đăng ký mới
        </Link>
      </CardFooter>
    </Card>
  );
}
