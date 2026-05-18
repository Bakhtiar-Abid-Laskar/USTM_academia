"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building2, BookOpen, FileText, Plus, Search, ChevronRight, Loader2, Clock,
} from "lucide-react";

interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
  course_count: number;
  document_count: number;
}

interface DashStats {
  department_count: number;
  course_count: number;
  document_count: number;
  recent_uploads: any[];
}

export default function AdminDashboardPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [stats, setStats] = useState<DashStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        // Force fresh fetch with no-cache header - bypass browser cache
        const res = await fetch("/api/admin/dashboard", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache, no-store, must-revalidate" }
        });
        const data = await res.json();
        if (data && typeof data === "object") {
          setStats(data);
          if (Array.isArray(data.departments)) setDepartments(data.departments);
        }
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-main">{stats?.department_count || 0}</p>
              <p className="text-sm text-text-muted">Departments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-main">{stats?.course_count || 0}</p>
              <p className="text-sm text-text-muted">Courses</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-orange-50 flex items-center justify-center">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-main">{stats?.document_count || 0}</p>
              <p className="text-sm text-text-muted">Documents</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Departments Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-text-main">Departments</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Search departments..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 w-60"
            />
          </div>
          <Link href="/admin/departments/new">
            <Button><Plus className="h-4 w-4 mr-2" />Add Department</Button>
          </Link>
        </div>
      </div>

      {/* Department Cards */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-text-muted">No departments found.</p>
            <Link href="/admin/departments/new">
              <Button className="mt-4"><Plus className="h-4 w-4 mr-2" />Create First Department</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(dept => (
            <Link key={dept.id} href={`/admin/departments/${dept.id}`}>
              <Card className="hover:shadow-md transition-shadow h-full cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-text-muted" />
                  </div>
                  <h3 className="font-semibold text-text-main text-sm mb-1 line-clamp-2">{dept.name}</h3>
                  {dept.description && (
                    <p className="text-xs text-text-muted mb-3 line-clamp-2">{dept.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3">
                    <Badge variant="outline" className="text-xs">
                      <BookOpen className="h-3 w-3 mr-1" />{dept.course_count} Courses
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <FileText className="h-3 w-3 mr-1" />{dept.document_count} Docs
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Recent Uploads */}
      {stats?.recent_uploads && stats.recent_uploads.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-text-muted" />
            Recent Uploads
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {stats.recent_uploads.map((doc: any) => (
                  <div key={doc.id} className="px-5 py-3 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text-main truncate">{doc.title}</p>
                      <p className="text-xs text-text-muted">
                        {doc.course?.short_name} • {doc.document_type?.name}
                      </p>
                    </div>
                    <span className="text-xs text-text-muted flex-shrink-0 ml-4">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
