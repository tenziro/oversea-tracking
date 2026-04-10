import * as React from "react";
import {
  IconPalette,
  IconShield,
  IconInfoCircle,
  IconBrandGithub,
  IconExternalLink,
  IconPackageImport,
} from "@tabler/icons-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Separator } from "@/components/ui/separator";

function SettingSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
        {title}
      </h2>
      <div className="rounded-xl border bg-card overflow-hidden">{children}</div>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  label,
  description,
  action,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/15">
        <Icon size={16} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
      {/* 테마 설정 */}
      <SettingSection title="화면">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/15">
              <IconPalette size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">테마</p>
              <p className="text-xs text-muted-foreground">앱 표시 모드를 선택하세요</p>
            </div>
          </div>
          <ThemeToggle className="w-full" />
        </div>
      </SettingSection>

      {/* 데이터 출처 */}
      <SettingSection title="데이터 출처">
        <SettingRow
          icon={IconShield}
          label="관세청 유니패스"
          description="화물통관진행정보 조회 API"
          action={
            <a
              href="https://unipass.customs.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              바로가기
              <IconExternalLink size={12} />
            </a>
          }
        />
        <Separator className="ml-16" />
        <SettingRow
          icon={IconInfoCircle}
          label="공공데이터포털"
          description="API 서비스 신청 및 인증키 발급"
          action={
            <a
              href="https://www.data.go.kr/data/15012455/openapi.do"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              바로가기
              <IconExternalLink size={12} />
            </a>
          }
        />
      </SettingSection>

      {/* 앱 정보 */}
      <SettingSection title="앱 정보">
        <SettingRow icon={IconPackageImport} label="화물통관 조회" description="버전 1.0.0" />
        <Separator className="ml-16" />
        <SettingRow
          icon={IconBrandGithub}
          label="오픈소스"
          description="GitHub에서 소스코드 확인"
          action={
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <IconExternalLink size={14} />
            </a>
          }
        />
      </SettingSection>

      {/* 법적 고지 */}
      <p className="text-center text-xs text-muted-foreground pb-4">
        본 서비스는 관세청 공공 API를 활용하여 제공됩니다.
        <br />
        실제 통관 정보는 관세청 유니패스에서 확인하세요.
      </p>
    </div>
  );
}
