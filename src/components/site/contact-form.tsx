"use client";

import { useState } from "react";

// 送信先はタスク15で確定予定のため、現時点では送信処理を接続しない。
// 送信操作時は「準備中」の案内を表示する。
export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const fieldClass =
    "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600";

  return (
    <form
      className="mt-6 space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      {submitted && (
        <p
          role="status"
          className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          現在、お問い合わせフォームの送信機能は準備中です。お急ぎの場合は
          support@genbaboxx.co.jp までご連絡ください。
        </p>
      )}

      <div>
        <label htmlFor="name" className="text-sm font-semibold text-slate-700">
          お名前<span className="ml-1 text-red-600">*</span>
        </label>
        <input id="name" name="name" type="text" required className={fieldClass} />
      </div>

      <div>
        <label
          htmlFor="company"
          className="text-sm font-semibold text-slate-700"
        >
          会社名
        </label>
        <input id="company" name="company" type="text" className={fieldClass} />
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-semibold text-slate-700">
          メールアドレス<span className="ml-1 text-red-600">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="type" className="text-sm font-semibold text-slate-700">
          お問い合わせ種別
        </label>
        <select id="type" name="type" className={fieldClass} defaultValue="general">
          <option value="general">記事・メディアについて</option>
          <option value="bakusoq">BAKUSOQの資料請求・導入相談</option>
          <option value="other">その他</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="message"
          className="text-sm font-semibold text-slate-700"
        >
          お問い合わせ内容<span className="ml-1 text-red-600">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          className={fieldClass}
        />
      </div>

      <button
        type="submit"
        className="inline-flex items-center rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
      >
        送信する
      </button>
    </form>
  );
}
