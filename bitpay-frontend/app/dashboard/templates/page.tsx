"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BLOCKS_PER_MONTH } from "@/lib/contracts/config";
import { TemplatesHeader } from "@/components/dashboard/templates/TemplatesHeader";
import { TemplateForm } from "@/components/dashboard/templates/form/TemplateForm";
import { TemplateCard } from "@/components/dashboard/templates/list/TemplateCard";
import { EmptyTemplates } from "@/components/dashboard/templates/list/EmptyTemplates";
import { TemplatesInfo } from "@/components/dashboard/templates/TemplatesInfo";

interface StreamTemplate {
  id: string;
  name: string;
  description: string;
  amount: string;
  durationBlocks: number;
  durationLabel: string;
  category: "salary" | "contract" | "vesting" | "custom";
}

const DEFAULT_TEMPLATES: StreamTemplate[] = [
  {
    id: "monthly-salary",
    name: "Monthly Salary",
    description: "Standard monthly salary payment stream",
    amount: "5.0",
    durationBlocks: BLOCKS_PER_MONTH,
    durationLabel: "30 days",
    category: "salary",
  },
  {
    id: "weekly-contract",
    name: "Weekly Contract",
    description: "Weekly contractor payment",
    amount: "1.0",
    durationBlocks: BLOCKS_PER_WEEK,
    durationLabel: "7 days",
    category: "contract",
  },
  {
    id: "quarterly-vesting",
    name: "Quarterly Vesting",
    description: "3-month vesting schedule",
    amount: "10.0",
    durationBlocks: BLOCKS_PER_MONTH * 3,
    durationLabel: "90 days",
    category: "vesting",
  },
  {
    id: "annual-vesting",
    name: "Annual Vesting",
    description: "1-year vesting schedule",
    amount: "50.0",
    durationBlocks: BLOCKS_PER_MONTH * 12,
    durationLabel: "365 days",
    category: "vesting",
  },
];

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<StreamTemplate[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bitpay-stream-templates");
      return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
    }
    return DEFAULT_TEMPLATES;
  });

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: "",
    durationBlocks: BLOCKS_PER_MONTH,
    durationLabel: "30 days",
    category: "custom" as StreamTemplate["category"],
  });

  const saveTemplates = (newTemplates: StreamTemplate[]) => {
    setTemplates(newTemplates);
    if (typeof window !== "undefined") {
      localStorage.setItem("bitpay-stream-templates", JSON.stringify(newTemplates));
    }
  };

  const handleCreateTemplate = () => {
    if (!formData.name || !formData.amount) return;

    const newTemplate: StreamTemplate = {
      id: `custom-${Date.now()}`,
      ...formData,
    };

    saveTemplates([...templates, newTemplate]);
    resetForm();
  };

  const handleUpdateTemplate = () => {
    if (!editingId || !formData.name || !formData.amount) return;

    saveTemplates(
      templates.map((t) => (t.id === editingId ? { ...t, ...formData } : t))
    );
    resetForm();
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm("Delete this template?")) {
      saveTemplates(templates.filter((t) => t.id !== id));
    }
  };

  const handleEditTemplate = (template: StreamTemplate) => {
    setFormData({
      name: template.name,
      description: template.description,
      amount: template.amount,
      durationBlocks: template.durationBlocks,
      durationLabel: template.durationLabel,
      category: template.category,
    });
    setEditingId(template.id);
    setIsCreating(true);
  };

  const handleUseTemplate = (template: StreamTemplate) => {
    // Store template data in localStorage for stream creation page
    if (typeof window !== "undefined") {
      localStorage.setItem("bitpay-stream-template-data", JSON.stringify(template));
    }
    router.push("/dashboard/streams/create");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      amount: "",
      durationBlocks: BLOCKS_PER_MONTH,
      durationLabel: "30 days",
      category: "custom",
    });
    setIsCreating(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <TemplatesHeader
        isCreating={isCreating}
        onToggleCreate={() => setIsCreating(!isCreating)}
      />

      {isCreating && (
        <TemplateForm
          formData={formData}
          isEditing={!!editingId}
          onFormChange={setFormData}
          onSubmit={editingId ? handleUpdateTemplate : handleCreateTemplate}
          onCancel={resetForm}
        />
      )}

      {templates.length === 0 ? (
        <EmptyTemplates onCreateClick={() => setIsCreating(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUse={handleUseTemplate}
              onEdit={handleEditTemplate}
              onDelete={handleDeleteTemplate}
            />
          ))}
        </div>
      )}

      <TemplatesInfo />
    </div>
  );
}
