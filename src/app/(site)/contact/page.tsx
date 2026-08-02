import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ContactForm } from "@/components/site/contact-form";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description:
    "記事・メディアに関するお問い合わせ、BAKUSOQの資料請求・導入相談はこちらから。",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Breadcrumbs
        items={[{ label: "ホーム", href: "/" }, { label: "お問い合わせ" }]}
      />

      <h1 className="mt-4 text-2xl font-bold text-slate-900">お問い合わせ</h1>
      <p className="mt-3 leading-relaxed text-slate-600">
        記事・メディアに関するご意見、BAKUSOQの資料請求・導入のご相談などをお受けしています。以下のフォームよりお送りください。
      </p>

      <ContactForm />
    </div>
  );
}
