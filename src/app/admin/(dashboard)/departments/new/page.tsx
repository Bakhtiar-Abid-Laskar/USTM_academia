"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminBreadcrumb } from "@/components/admin/breadcrumb";
import { Loader2 } from "lucide-react";
import { slugify } from "@/lib/utils";

export default function NewDepartmentPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", code: "", description: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.code) {
      setError("Name and code are required");
      return;
    }
    setSaving(true);
    setError("");

    const res = await fetch("/api/admin/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "Failed to create department");
      setSaving(false);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div>
      <AdminBreadcrumb items={[
        { label: "Departments", href: "/admin/dashboard" },
        { label: "New Department" },
      ]} />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Create Department</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="text-sm text-error bg-red-50 p-3 rounded-md mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Department Name *</Label>
              <Input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value, code: slugify(e.target.value) })}
                placeholder="Department of Engineering and Technology"
              />
            </div>
            <div className="space-y-2">
              <Label>Code *</Label>
              <Input
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value })}
                placeholder="engineering-technology"
              />
              <p className="text-xs text-text-muted">Unique identifier, auto-generated from name</p>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of the department"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Create Department
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
