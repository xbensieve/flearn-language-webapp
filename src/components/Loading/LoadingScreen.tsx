import React, { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LoadingScreenProps {
  /** * Nếu có message cụ thể (ví dụ: "Đang tải dữ liệu...", "Đang xác thực...")
   * Mặc định sẽ là "Initializing system..."
   */
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Initializing workspace...",
}) => {
  const [progress, setProgress] = useState(13);

  // Hiệu ứng giả lập thanh loading chạy (Fake progress)
  // Giúp người dùng cảm thấy ứng dụng đang thực sự xử lý
  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    const timer2 = setTimeout(() => setProgress(90), 1000);

    // Lưu ý: Không bao giờ set 100% ở đây, hãy để logic thật của app
    // unmount component này khi tải xong.

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground">
      {/* Container chính */}
      <div className="w-full max-w-[320px] px-6 flex flex-col items-center gap-8 animate-in fade-in duration-500 zoom-in-95">
        {/* LOGO AREA - Có hiệu ứng Pulse nhẹ */}
        <div className="relative flex items-center justify-center mb-4">
          {/* Vòng tròn nền mờ sau logo */}
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />

          <div className="relative z-10 flex flex-col items-center gap-3">
            <h1 className="flex items-center justify-center gap-2 text-3xl font-bold tracking-tight text-foreground">
              <GraduationCap className="h-10 w-10" />
              FLearn
            </h1>
          </div>
        </div>

        {/* PROGRESS BAR & TEXT */}
        <div className="w-full space-y-4">
          {/* Thanh Progress mỏng, tinh tế */}
          <Progress value={progress} className="h-1.5 w-full bg-muted" />

          <div className="flex justify-between text-xs text-muted-foreground font-medium uppercase tracking-wider">
            <span>{message}</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>

      {/* FOOTER (Optional - Dành cho Enterprise branding) */}
      <div className="absolute bottom-8 text-[10px] text-muted-foreground/50 uppercase tracking-widest">
        Secure Enterprise Environment
      </div>
    </div>
  );
};

export default LoadingScreen;
