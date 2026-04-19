"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createActions } from "@/lib/onboarding/mutations";

type Target = {
  id: string;
  title: string;
  current_value: number;
  target_value: number;
};

type ActionCard = { localId: number; title: string };

let uidCounter = 0;
const uid = () => ++uidCounter;

export function OnboardingActionsForm({
  locale,
  targets,
  initialByTarget,
}: {
  locale: string;
  targets: Target[];
  initialByTarget: Record<string, string[]>;
}) {
  const t = useTranslations("onboarding.actions");
  const [byTarget, setByTarget] = useState<Record<string, ActionCard[]>>(() => {
    const init: Record<string, ActionCard[]> = {};
    for (const target of targets) {
      const titles = initialByTarget[target.id] ?? [];
      init[target.id] =
        titles.length > 0
          ? titles.map((title) => ({ localId: uid(), title }))
          : [{ localId: uid(), title: "" }];
    }
    return init;
  });

  const updateCard = (targetId: string, localId: number, title: string) => {
    setByTarget((prev) => ({
      ...prev,
      [targetId]: (prev[targetId] ?? []).map((c) =>
        c.localId === localId ? { ...c, title } : c,
      ),
    }));
  };

  const addCard = (targetId: string) => {
    setByTarget((prev) => ({
      ...prev,
      [targetId]: [...(prev[targetId] ?? []), { localId: uid(), title: "" }],
    }));
  };

  const removeCard = (targetId: string, localId: number) => {
    setByTarget((prev) => {
      const current = prev[targetId] ?? [];
      if (current.length <= 1) return prev;
      return {
        ...prev,
        [targetId]: current.filter((c) => c.localId !== localId),
      };
    });
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const hasAny = Object.values(byTarget).some((cards) =>
      cards.some((c) => c.title.trim().length > 0),
    );
    if (!hasAny) {
      e.preventDefault();
    }
  };

  return (
    <form
      action={createActions}
      onSubmit={onSubmit}
      className="flex flex-col gap-6"
    >
      <input type="hidden" name="locale" value={locale} />

      {targets.map((target) => {
        const cards = byTarget[target.id] ?? [];
        const context = t("sectionContext", {
          current: target.current_value,
          target: target.target_value,
        });

        return (
          <section
            key={target.id}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
          >
            <header className="flex flex-col gap-1">
              <span className="font-body text-sm font-medium text-accent">
                {target.title}
              </span>
              <span className="font-mono text-xs text-muted">{context}</span>
            </header>

            <div className="flex flex-col gap-2">
              {cards.map((card) => (
                <div
                  key={card.localId}
                  className="flex items-center gap-2 rounded-md border border-border bg-bg px-2 py-1.5"
                >
                  <input
                    type="text"
                    name={`actions_${target.id}`}
                    value={card.title}
                    onChange={(e) =>
                      updateCard(target.id, card.localId, e.target.value)
                    }
                    placeholder={t("placeholder")}
                    className="flex-1 bg-transparent px-1 py-1 font-body text-sm outline-none"
                  />
                  {cards.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeCard(target.id, card.localId)}
                      aria-label={t("remove")}
                      className="shrink-0 rounded px-2 py-0.5 font-mono text-xs text-muted hover:text-danger"
                    >
                      ✕
                    </button>
                  ) : null}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addCard(target.id)}
              className="self-start font-body text-xs text-muted underline-offset-2 hover:underline"
            >
              {t("addAction")}
            </button>
          </section>
        );
      })}

      <p className="font-body text-xs text-muted">{t("hint")}</p>

      <button
        type="submit"
        className="mt-2 w-full rounded-md bg-accent py-3 font-body text-sm text-white"
      >
        {t("cta")}
      </button>
    </form>
  );
}
