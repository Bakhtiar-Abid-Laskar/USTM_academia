import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function UploadLogsPage() {
  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("upload_logs")
    .select("*, admin:admins(name, email)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-main mb-6">Upload Logs</h1>
      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent>
          {!logs || logs.length === 0 ? (
            <p className="text-text-muted text-center py-8">No upload activity yet.</p>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-text-muted font-medium">Action</th>
                    <th className="text-left px-6 py-3 text-text-muted font-medium">File</th>
                    <th className="text-left px-6 py-3 text-text-muted font-medium hidden sm:table-cell">Admin</th>
                    <th className="text-left px-6 py-3 text-text-muted font-medium hidden md:table-cell">Notes</th>
                    <th className="text-left px-6 py-3 text-text-muted font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log: any) => (
                    <tr key={log.id} className="border-b border-border last:border-0">
                      <td className="px-6 py-3">
                        <Badge variant={
                          log.action === "upload" ? "success" :
                          log.action === "delete" ? "error" :
                          log.action === "update" ? "warning" : "default"
                        }>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-text-main max-w-[200px] truncate">{log.file_name}</td>
                      <td className="px-6 py-3 text-text-muted hidden sm:table-cell">{log.admin?.name || log.admin?.email || "-"}</td>
                      <td className="px-6 py-3 text-text-muted text-xs hidden md:table-cell max-w-[200px] truncate">{log.notes || "-"}</td>
                      <td className="px-6 py-3 text-text-muted text-xs">{formatDate(log.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
