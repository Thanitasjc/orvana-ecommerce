"use client";

import { useState } from "react";
import { AdminPanel } from "@/components/admin/AdminPanel";

type CmsSection = {
  key: string;
  label: string;
  title: string;
  subtitle: string;
  enabled: boolean;
  items: string[];
};

const initialSections: CmsSection[] = [
  {
    key: "hero_banner",
    label: "hero banner",
    title: "Hero Banner",
    subtitle: "Main slider and call-to-action section",
    enabled: true,
    items: ["Slide 1", "Slide 2", "Slide 3"],
  },
  {
    key: "customer_favorite",
    label: "Customer Favorite",
    title: "Customer Favorite",
    subtitle: "Tab products and favorite style grid",
    enabled: true,
    items: ["Whitetails Women's Open Sky", "Simple Modern School Boys"],
  },
  {
    key: "featured_products",
    label: "Featured Products",
    title: "Featured Products",
    subtitle: "Featured product cards from API",
    enabled: true,
    items: ["Backend featured product #1", "Backend featured product #2"],
  },
];

export function AdminCmsEditor() {
  const [sections, setSections] = useState<CmsSection[]>(initialSections);
  const [activeKey, setActiveKey] = useState(initialSections[0].key);
  const [draftItem, setDraftItem] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const activeSection = sections.find((section) => section.key === activeKey) ?? sections[0];

  function patchActiveSection(patch: Partial<CmsSection>) {
    setSections((prev) =>
      prev.map((section) => (section.key === activeKey ? { ...section, ...patch } : section)),
    );
  }

  function addItem() {
    const value = draftItem.trim();
    if (!value) return;
    patchActiveSection({ items: [...activeSection.items, value] });
    setDraftItem("");
  }

  function removeItem(index: number) {
    patchActiveSection({ items: activeSection.items.filter((_, itemIndex) => itemIndex !== index) });
  }

  function saveCurrentSection() {
    setSaveMessage(`บันทึก "${activeSection.label}" แล้ว (local preview)`);
    window.setTimeout(() => setSaveMessage(""), 2500);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <AdminPanel title="Homepage Sections">
        <div className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => setActiveKey(section.key)}
              className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                section.key === activeKey
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </AdminPanel>

      <AdminPanel title={activeSection.label}>
        <p className="mb-4 text-sm text-slate-400">แก้ไขรายละเอียด section หน้าแรก</p>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-slate-400">Title</label>
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white"
              value={activeSection.title}
              onChange={(event) => patchActiveSection({ title: event.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Status</label>
            <label className="flex h-[42px] items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={activeSection.enabled}
                onChange={(event) => patchActiveSection({ enabled: event.target.checked })}
              />
              {activeSection.enabled ? "Active" : "Disabled"}
            </label>
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm text-slate-400">Subtitle</label>
          <textarea
            className="min-h-[88px] w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            value={activeSection.subtitle}
            onChange={(event) => patchActiveSection({ subtitle: event.target.value })}
          />
        </div>

        <div className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-slate-300">Items</h3>
          <div className="space-y-2">
            {activeSection.items.map((item, index) => (
              <div key={`${activeSection.key}-${index}`} className="flex items-center gap-2">
                <input
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white"
                  value={item}
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="rounded-md border border-rose-500/40 px-2 py-2 text-xs text-rose-300"
                >
                  ลบ
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white"
              placeholder="New item title"
              value={draftItem}
              onChange={(event) => setDraftItem(event.target.value)}
            />
            <button
              type="button"
              onClick={addItem}
              className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
            >
              Add
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={saveCurrentSection}
            className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Save Section
          </button>
          {saveMessage ? <span className="text-sm text-emerald-400">{saveMessage}</span> : null}
        </div>
      </AdminPanel>
    </div>
  );
}
