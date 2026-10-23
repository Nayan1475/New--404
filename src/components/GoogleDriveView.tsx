import React, { useState, useEffect } from 'react';
import { useTracker } from '../context/TrackerContext';
import {
  listDriveFiles,
  readDriveFileContent,
  deleteDriveFile,
  getDriveStorageQuota,
  DriveFileItem,
  DriveStorageQuota,
} from '../services/googleDriveService';
import {
  HardDrive,
  Cloud,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Folder,
  FileText,
  ExternalLink,
  ShieldCheck,
  Lock,
  LogOut,
  Clock,
  Sparkles,
} from 'lucide-react';

export const GoogleDriveView: React.FC = () => {
  const {
    driveUser,
    isDriveConnected,
    driveLogin,
    driveLogout,
    backupCurrentDayToDrive,
    importPhoneLogs,
    selectedDate,
    setActiveTab,
  } = useTracker();

  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [quota, setQuota] = useState<DriveStorageQuota | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusNotice, setStatusNotice] = useState<{ success: boolean; message: string } | null>(null);

  // Mandatory Confirmation Modal for Destructive Workspace Operation
  const [deleteTarget, setDeleteTarget] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Restore Target
  const [isRestoringId, setIsRestoringId] = useState<string | null>(null);

  const fetchFiles = async () => {
    if (!isDriveConnected) return;
    setIsLoading(true);
    try {
      const data = await listDriveFiles(searchQuery, 25);
      setFiles(data.files || []);
      const storage = await getDriveStorageQuota();
      setQuota(storage);
    } catch (err: any) {
      console.error(err);
      setStatusNotice({ success: false, message: err.message || 'Failed to load Google Drive files.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isDriveConnected) {
      fetchFiles();
    }
  }, [isDriveConnected]);

  const handleBackupNow = async () => {
    setIsBackingUp(true);
    setStatusNotice(null);
    const result = await backupCurrentDayToDrive();
    setIsBackingUp(false);
    setStatusNotice(result);
    if (result.success) {
      fetchFiles();
    }
  };

  const handleRestoreFile = async (file: DriveFileItem) => {
    setIsRestoringId(file.id);
    try {
      const content = await readDriveFileContent(file.id);
      const strContent = typeof content === 'string' ? content : JSON.stringify(content);
      const res = importPhoneLogs(strContent);
      setStatusNotice(res);
      if (res.success) {
        setTimeout(() => setActiveTab('timeline'), 1500);
      }
    } catch (err: any) {
      setStatusNotice({ success: false, message: `Restore failed: ${err.message}` });
    } finally {
      setIsRestoringId(null);
    }
  };

  const confirmDeleteFile = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(deleteTarget.id);
      setStatusNotice({ success: true, message: `Deleted "${deleteTarget.name}" from your Google Drive.` });
      setDeleteTarget(null);
      fetchFiles();
    } catch (err: any) {
      setStatusNotice({ success: false, message: `Delete failed: ${err.message}` });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return '—';
    const num = parseInt(bytes, 10);
    if (isNaN(num)) return '—';
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatStorageUsage = (usageBytes?: string, limitBytes?: string) => {
    if (!usageBytes) return 'Storage active';
    const usedGb = (parseInt(usageBytes, 10) / (1024 * 1024 * 1024)).toFixed(2);
    if (!limitBytes || limitBytes === '-1') return `${usedGb} GB used`;
    const totalGb = (parseInt(limitBytes, 10) / (1024 * 1024 * 1024)).toFixed(0);
    return `${usedGb} GB of ${totalGb} GB used`;
  };

  return (
    <div className="space-y-5">
      {/* Status Notice Banner */}
      {statusNotice && (
        <div
          className={`p-3.5 rounded-lg text-xs flex items-center justify-between border ${
            statusNotice.success
              ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/70 border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusNotice.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{statusNotice.message}</span>
          </div>
          <button onClick={() => setStatusNotice(null)} className="text-slate-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Main Drive Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-emerald-400 uppercase">
                Google Workspace Integration
              </span>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <span className="text-xs font-mono text-slate-400">
                Official Google Drive v3 API
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Cloud className="w-5 h-5 text-indigo-400" />
              <span>Google Drive Cloud Sync &amp; Vault Backups</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Connect your Google Drive with permission to safely archive personal activity logs, call records, and message forensics to your private Google Drive account.
            </p>
          </div>

          {/* Authentication State / Action */}
          <div className="shrink-0">
            {isDriveConnected && driveUser ? (
              <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {driveUser.photoURL ? (
                    <img src={driveUser.photoURL} alt={driveUser.displayName || 'Google User'} className="w-full h-full object-cover" />
                  ) : (
                    driveUser.email?.charAt(0).toUpperCase() || 'G'
                  )}
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-white truncate max-w-[150px]">
                    {driveUser.displayName || 'Connected'}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 truncate max-w-[150px]">
                    {driveUser.email}
                  </div>
                </div>
                <button
                  onClick={driveLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded transition-colors"
                  title="Sign out of Google Drive"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Official Styled Sign in with Google Button as mandated by Workspace skill */
              <button
                onClick={driveLogin}
                className="flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-800 font-medium text-xs rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span className="font-semibold text-slate-800">Sign in with Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Drive Storage Banner */}
        {isDriveConnected && quota && (
          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
              <span>Google Drive Quota: <strong className="text-slate-200">{formatStorageUsage(quota.usage, quota.limit)}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-emerald-400">OAuth Scopes Active</span>
              <span>·</span>
              <span>Direct Client-Side Token Bearer</span>
            </div>
          </div>
        )}
      </div>

      {/* Cloud Actions Toolbar */}
      {isDriveConnected ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Upload Today&apos;s Logs to Drive</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Backs up calls, SMS, WhatsApp alerts, and GPS waypoints for <strong className="text-slate-200">{selectedDate}</strong> into folder &quot;PhonePulse Tracker Archives&quot;.
              </p>
            </div>
            <button
              onClick={handleBackupNow}
              disabled={isBackingUp}
              className="w-full py-2 px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              {isBackingUp ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading to Drive...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Backup {selectedDate} Now</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Folder className="w-4 h-4 text-indigo-400" />
                <span>Dedicated Cloud Vault</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Archives are automatically grouped in a private folder <code className="text-indigo-300 font-mono">PhonePulse Tracker Archives</code> on your Google Drive.
              </p>
            </div>
            <button
              onClick={fetchFiles}
              disabled={isLoading}
              className="w-full py-2 px-3 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-750 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Files</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Client Token Encryption</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Tokens are held strictly in runtime browser memory and never written to disk or third-party servers.
              </p>
            </div>
            <div className="text-[11px] font-mono text-emerald-400 bg-slate-950 p-2 rounded border border-slate-800 flex items-center justify-between">
              <span>Token Status:</span>
              <span>Active In-Memory</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center space-y-3">
          <Cloud className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">Google Drive Is Not Connected</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click the &quot;Sign in with Google&quot; button above to grant permission to sync your daily activity history, calls, and encrypted backups directly to your Google Drive.
          </p>
        </div>
      )}

      {/* Drive File Browser & Restore Section */}
      {isDriveConnected && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white">Google Drive Telemetry &amp; Files Explorer</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Browse, restore, or manage backup files saved on your Google Drive
              </p>
            </div>

            {/* Search Input */}
            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchFiles()}
                placeholder="Search Drive files..."
                className="w-full bg-slate-950 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Files List */}
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Loading Google Drive files...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No files found in Google Drive. Click &quot;Backup Today Now&quot; to upload your first activity archive!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="py-2.5 px-3 font-medium">File Name</th>
                    <th className="py-2.5 px-3 font-medium">Size</th>
                    <th className="py-2.5 px-3 font-medium">Modified Time</th>
                    <th className="py-2.5 px-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {files.map((file) => {
                    const isJson = file.name.endsWith('.json') || file.mimeType.includes('json');
                    const isRestoring = isRestoringId === file.id;
                    return (
                      <tr key={file.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-sans">
                          <div className="flex items-center gap-2">
                            {isJson ? (
                              <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <Folder className="w-4 h-4 text-indigo-400 shrink-0" />
                            )}
                            <div>
                              <div className="font-semibold text-slate-200 text-xs">{file.name}</div>
                              <div className="text-[10px] font-mono text-slate-500">{file.mimeType}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-400 tabular-nums">
                          {formatFileSize(file.size)}
                        </td>
                        <td className="py-3 px-3 text-slate-400 tabular-nums">
                          {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 font-sans">
                            {isJson && (
                              <button
                                onClick={() => handleRestoreFile(file)}
                                disabled={isRestoring}
                                className="px-2 py-1 text-[11px] font-medium text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/80 rounded transition-colors flex items-center gap-1"
                                title="Restore this backup into dashboard"
                              >
                                <Download className="w-3 h-3" />
                                <span>{isRestoring ? 'Restoring...' : 'Restore'}</span>
                              </button>
                            )}

                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                                title="Open in Google Drive"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}

                            <button
                              onClick={() => setDeleteTarget(file)}
                              className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                              title="Delete from Google Drive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MANDATORY USER CONFIRMATION MODAL FOR DESTRUCTIVE DRIVE OPERATIONS */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-800">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Delete File from Google Drive?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">&quot;{deleteTarget.name}&quot;</strong> from your Google Drive?
              This action cannot be undone.
            </p>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
              <div>File ID: {deleteTarget.id}</div>
              <div>Size: {formatFileSize(deleteTarget.size)}</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteFile}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-md transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
