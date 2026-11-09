"use client";

import { useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { ButtonNative } from "@/components/ui/Button";
import { Field, fieldClass } from "@/components/ui/Field";
import { siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";

type FormState = "idle" | "loading" | "success" | "error";

const CONTACT_API_URL = (
  process.env.NEXT_PUBLIC_CONTACT_API_URL ||
  process.env.NEXT_PUBLIC_CATALOG_API_URL ||
  ""
)
  .trim()
  .replace(/\/$/, "");

export function ContactForm({ className }: { className?: string }) {
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      company: String(formData.get("company") || ""),
      phone: String(formData.get("phone") || ""),
      projectType: String(formData.get("projectType") || ""),
      message: String(formData.get("message") || ""),
    };

    if (!CONTACT_API_URL) {
      setFormState("error");
      setErrorMessage(
        `Contact is temporarily unavailable. Email us at ${siteConfig.email}.`,
      );
      return;
    }

    setFormState("loading");
    setErrorMessage("");
    try {
      const response = await fetch(`${CONTACT_API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          (result as { error?: string }).error || "Something went wrong",
        );
      }
      form.reset();
      setFormState("success");
    } catch (error) {
      setFormState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to send message",
      );
    }
  }

  if (formState === "success") {
    return (
      <div
        className={cn(
          "flex flex-col items-start rounded-[var(--radius-md)] border-2 border-border bg-white px-6 py-10 sm:px-10",
          className,
        )}
      >
        <CheckCircle size={36} className="text-brand-accent-dark" />
        <h3 className="mt-4 text-xl font-bold">Message sent</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-grey-olive">
          Thanks for reaching out. We sent a confirmation to your email and will
          be in touch within 24–48 hours.
        </p>
        <ButtonNative
          variant="outline"
          size="sm"
          className="mt-6"
          onClick={() => setFormState("idle")}
        >
          Send another message
        </ButtonNative>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "rounded-[var(--radius-md)] border-2 border-border bg-white p-5 sm:p-8",
        className,
      )}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Full name" htmlFor="name" required>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={fieldClass}
            placeholder="Jane Smith"
          />
        </Field>
        <Field label="Email" htmlFor="email" required>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
            placeholder="jane@yourteam.com"
          />
        </Field>
        <Field label="Company or team" htmlFor="company">
          <input
            id="company"
            name="company"
            type="text"
            autoComplete="organization"
            className={fieldClass}
            placeholder="Brand, club, business"
          />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={fieldClass}
            placeholder="(555) 555-5555"
          />
        </Field>
      </div>

      <Field
        label="What are you making?"
        htmlFor="projectType"
        className="mt-5"
      >
        <select
          id="projectType"
          name="projectType"
          className={fieldClass}
          defaultValue=""
        >
          <option value="">Select one</option>
          <option value="embroidered-hats">Embroidered hats</option>
          <option value="patch-hats">Leather or PVC patch hats</option>
          <option value="screen-print-hats">Screen printed hats</option>
          <option value="beanies">Beanies</option>
          <option value="not-sure">Not sure yet</option>
        </select>
      </Field>

      <Field
        label="Tell us about your project"
        htmlFor="message"
        required
        className="mt-5"
      >
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className={cn(fieldClass, "resize-none")}
          placeholder="What kind of hat, about how many, and when do you need them?"
        />
      </Field>

      {formState === "error" && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} />
          {errorMessage}
        </div>
      )}

      <ButtonNative
        type="submit"
        variant="secondary"
        size="lg"
        arrow={formState !== "loading"}
        className="mt-6 w-full sm:w-auto sm:px-8"
        disabled={formState === "loading"}
      >
        {formState === "loading" ? "Sending..." : "Send message"}
      </ButtonNative>
    </form>
  );
}
