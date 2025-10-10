"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Plus,
  Clock,
  Calendar,
  DollarSign,
  Trash2,
  Edit,
  Copy,
} from "lucide-react";
import { BLOCKS_PER_DAY, BLOCKS_PER_WEEK, BLOCKS_PER_MONTH } from "@/lib/contracts/config";

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

  const getCategoryColor = (category: StreamTemplate["category"]) => {
    switch (category) {
      case "salary":
        return "bg-blue-500";
      case "contract":
        return "bg-green-500";
      case "vesting":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Stream Templates</h1>
          <p className="text-muted-foreground">
            Save and reuse common payment stream configurations
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-brand-pink hover:bg-brand-pink/90 text-white"
        >
          {isCreating ? "Cancel" : <><Plus className="mr-2 h-4 w-4" /> Create Template</>}
        </Button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card className="border-brand-pink/20">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Template" : "Create New Template"}</CardTitle>
            <CardDescription>
              Define a reusable template for stream creation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  placeholder="Monthly Salary"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as StreamTemplate["category"] })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="salary">Salary</option>
                  <option value="contract">Contract</option>
                  <option value="vesting">Vesting</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this template..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (sBTC)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.000001"
                  placeholder="5.0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <select
                  id="duration"
                  value={formData.durationBlocks}
                  onChange={(e) => {
                    const blocks = parseInt(e.target.value);
                    const labels: Record<number, string> = {
                      [BLOCKS_PER_WEEK]: "7 days",
                      [BLOCKS_PER_MONTH]: "30 days",
                      [BLOCKS_PER_MONTH * 3]: "90 days",
                      [BLOCKS_PER_MONTH * 6]: "180 days",
                      [BLOCKS_PER_MONTH * 12]: "365 days",
                    };
                    setFormData({
                      ...formData,
                      durationBlocks: blocks,
                      durationLabel: labels[blocks] || `${blocks} blocks`,
                    });
                  }}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value={BLOCKS_PER_WEEK}>1 Week (~{BLOCKS_PER_WEEK} blocks)</option>
                  <option value={BLOCKS_PER_MONTH}>1 Month (~{BLOCKS_PER_MONTH} blocks)</option>
                  <option value={BLOCKS_PER_MONTH * 3}>3 Months (~{BLOCKS_PER_MONTH * 3} blocks)</option>
                  <option value={BLOCKS_PER_MONTH * 6}>6 Months (~{BLOCKS_PER_MONTH * 6} blocks)</option>
                  <option value={BLOCKS_PER_MONTH * 12}>1 Year (~{BLOCKS_PER_MONTH * 12} blocks)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={editingId ? handleUpdateTemplate : handleCreateTemplate}
                className="bg-brand-pink hover:bg-brand-pink/90"
                disabled={!formData.name || !formData.amount}
              >
                {editingId ? "Update Template" : "Create Template"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:border-brand-pink/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-brand-pink" />
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  <Badge className={`${getCategoryColor(template.category)} text-white`}>
                    {template.category}
                  </Badge>
                </div>
              </div>
              <CardDescription className="mt-2">{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Amount
                  </span>
                  <span className="font-semibold">{template.amount} sBTC</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Duration
                  </span>
                  <span className="font-semibold">{template.durationLabel}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Blocks
                  </span>
                  <span className="font-semibold">{template.durationBlocks.toLocaleString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleUseTemplate(template)}
                  className="flex-1 bg-brand-teal hover:bg-brand-teal/90"
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Use Template
                </Button>
                {template.id.startsWith("custom-") && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No templates yet</p>
              <p className="text-sm mb-4">Create your first stream template</p>
              <Button
                onClick={() => setIsCreating(true)}
                className="bg-brand-pink hover:bg-brand-pink/90 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>About Stream Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Templates allow you to save common stream configurations for quick reuse. Default templates
            are provided for salary, contracts, and vesting schedules.
          </p>
          <p>
            When you use a template, it pre-fills the stream creation form with the saved values.
            You can still modify any field before creating the actual stream.
          </p>
          <p>
            Custom templates are saved in your browser and can be edited or deleted at any time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
