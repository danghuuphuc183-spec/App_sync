"use client";

import * as React from "react";
import { QUIZ_QUESTIONS, type QuizAnswers } from "@/features/sports/quiz.config";
import { recommendSports, type RecommendationResult } from "@/features/sports/recommend";
import { SEED_SPORTS } from "@/features/sports/sports.data";
import { Stepper } from "@/components/shared/stepper";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SportCard } from "@/components/shared/sport-card";
import { ArrowLeft, ArrowRight, Sparkles, Check, RotateCcw, Ghost } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SportQuizPage() {
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Partial<QuizAnswers>>({});
  const [results, setResults] = React.useState<RecommendationResult[] | null>(null);

  const currentQuestion = QUIZ_QUESTIONS[currentStepIndex];
  const totalQuestions = QUIZ_QUESTIONS.length;

  const handleSelectOption = (value: string) => {
    if (!currentQuestion) return;
    const updated = {
      ...answers,
      [currentQuestion.id]: value,
    };
    setAnswers(updated);

    // Lưu vào sessionStorage an toàn
    try {
      sessionStorage.setItem("sport_quiz_answers", JSON.stringify(updated));
    } catch {
      // Bỏ qua nếu storage bị chặn
    }

    // Tự động chuyển câu tiếp theo nếu chưa phải câu cuối
    if (currentStepIndex < totalQuestions - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Câu cuối cùng: Tính toán gợi ý
      calculateResults(updated as QuizAnswers);
    }
  };

  const calculateResults = (finalAnswers: QuizAnswers) => {
    const recommended = recommendSports(finalAnswers, SEED_SPORTS);
    setResults(recommended);
  };

  const handleRestart = () => {
    setAnswers({});
    setResults(null);
    setCurrentStepIndex(0);
    try {
      sessionStorage.removeItem("sport_quiz_answers");
    } catch {
      // Bỏ qua
    }
  };

  const stepperSteps = QUIZ_QUESTIONS.map((q, idx) => ({
    title: `Câu ${idx + 1}`,
  }));

  // MÀN HÌNH KẾT QUẢ GỢI Ý
  if (results) {
    const topSport = results[0];
    const otherSports = results.slice(1);

    return (
      <div className="container max-w-3xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
        <div className="text-center space-y-3">
          <Badge variant="success" className="mx-auto flex items-center gap-1.5 w-fit py-1 px-3">
            <Sparkles className="h-4 w-4" />
            <span>Kết quả phân tích thuật toán</span>
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Môn Thể Thao Phù Hợp Nhất Với Bạn
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Dựa trên mục tiêu, ngân sách, tính cách và khu vực bạn chọn.
          </p>
        </div>

        {/* Đề xuất Ghost Mode nếu người dùng ngại giao tiếp */}
        {topSport?.recommendGhostMode && (
          <div className="rounded-xl border border-primary/40 bg-primary/10 p-4 text-xs flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Ghost className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-foreground">Gợi ý kích hoạt Chế độ Hướng nội (Ghost Mode)</p>
              <p className="text-muted-foreground">
                Bạn đã chia sẻ là hơi ngại người lạ. Bạn hoàn toàn có thể tập chung, chỉ cần quét mã QR trong 5 giây mà không cần trò chuyện xã giao!
              </p>
            </div>
          </div>
        )}

        {/* Môn thể thao đứng đầu */}
        {topSport && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">
              Gợi ý ưu tiên số 1
            </h3>
            <Card className="border-2 border-primary shadow-lg overflow-hidden">
              <div className="bg-primary/15 px-6 py-2.5 text-xs font-semibold text-primary flex items-center justify-between">
                <span>Độ tương thích cao nhất</span>
                <span>Điểm khớp: {topSport.score} điểm</span>
              </div>
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl font-bold">{topSport.sport.nameVi}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {topSport.sport.descriptionVi}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Lý do đề xuất:
                  </span>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {topSport.reasonsVi.map((reason, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="pt-2 flex flex-col sm:flex-row gap-2">
                <Button asChild className="w-full sm:flex-1" size="lg">
                  <Link href={`/chon-mon/ho-so/${topSport.sport.slug}`}>
                    <span>Tạo hồ sơ {topSport.sport.nameVi}</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" onClick={handleRestart} size="lg" className="w-full sm:w-auto">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  <span>Làm lại Quiz</span>
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Các môn khác */}
        {otherSports.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">
              Các lựa chọn thay thế phù hợp
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {otherSports.map((item) => (
                <SportCard
                  key={item.sport.id}
                  id={item.sport.id}
                  slug={item.sport.slug}
                  nameVi={item.sport.nameVi}
                  category={item.sport.category}
                  verificationMode={item.sport.verificationMode}
                  phase={item.sport.phase}
                  isActive={item.sport.isActive}
                  descriptionVi={item.sport.descriptionVi}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // MÀN HÌNH ĐANG LÀM CÂU HỎI
  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Stepper */}
      <Stepper steps={stepperSteps} currentStep={currentStepIndex} />

      {currentQuestion && (
        <Card className="border-border shadow-md">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Câu hỏi {currentStepIndex + 1} / {totalQuestions}
              </span>
              <span className="font-medium text-primary">Khế ước thể thao</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold">
              {currentQuestion.title}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {currentQuestion.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 pt-2">
            {currentQuestion.options.map((opt) => {
              const isSelected = answers[currentQuestion.id] === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(opt.value)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all select-none flex items-center justify-between group min-h-[56px]",
                    isSelected
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20 text-foreground"
                      : "border-border bg-card hover:border-primary/50 hover:bg-muted/40 text-foreground"
                  )}
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-sm leading-tight">{opt.label}</p>
                    {opt.subLabel && (
                      <p className="text-xs text-muted-foreground">{opt.subLabel}</p>
                    )}
                  </div>
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30 group-hover:border-primary/50"
                    )}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t border-border pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentStepIndex === 0}
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              <span>Quay lại</span>
            </Button>

            <span className="text-xs text-muted-foreground">
              Chọn một đáp án để tự động tiếp tục
            </span>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
