import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import {
  Code2,
  Terminal,
  Workflow,
  Download,
  Copy,
  Check,
  Upload,
  FileCode,
  Smartphone,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

export const AndroidCompanionView: React.FC = () => {
  const { importPhoneLogs, setActiveTab } = useTracker();

  const [activeApproach, setActiveApproach] = useState<'kotlin' | 'tasker' | 'importer'>('kotlin');
  const [activeCodeFile, setActiveCodeFile] = useState<'manifest' | 'notification' | 'calls' | 'sim' | 'location'>('manifest');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Import state
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) return;
    const res = importPhoneLogs(importJsonText);
    setImportStatus(res);
    if (res.success) {
      setTimeout(() => {
        setActiveTab('timeline');
      }, 1800);
    }
  };

  const sampleJsonTemplate = JSON.stringify(
    {
      calls: [
        {
          type: 'incoming',
          channel: 'whatsapp',
          contactName: 'Aarav Patel',
          phoneNumberOrHandle: '+91 98200 99881',
          timestamp: '2026-10-20T10:15:00',
          timeFormatted: '10:15 AM',
          dateKey: '2026-10-20',
          durationSeconds: 180,
          callMedia: 'voice',
          notes: 'Logged via Tasker / MacroDroid trigger',
        },
      ],
      messages: [
        {
          source: 'whatsapp',
          direction: 'incoming',
          sender: 'Aarav Patel',
          senderHandleOrNumber: '+91 98200 99881',
          preview: 'Hey, I reached the office. Let me know when you are free.',
          timestamp: '2026-10-20T10:18:00',
          timeFormatted: '10:18 AM',
          dateKey: '2026-10-20',
          capturedVia: 'Notification Listener Service',
          isStarred: false,
        },
      ],
      waypoints: [
        {
          timestamp: '2026-10-20T10:25:00',
          timeFormatted: '10:25 AM',
          dateKey: '2026-10-20',
          latitude: 12.9716,
          longitude: 77.6412,
          placeName: 'MG Road Metro Station',
          address: 'Mahatma Gandhi Rd, Bengaluru',
          accuracyMeters: 8,
          activity: 'walking',
          speedKmh: 4.5,
          dwellTimeMinutes: 12,
          batteryLevel: 92,
        },
      ],
    },
    null,
    2
  );

  // Kotlin Code Snippets
  const codeSnippets = {
    manifest: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.phonepulse.tracker">

    <!-- Normal Calls & SMS Permissions -->
    <uses-permission android:name="android.permission.READ_CALL_LOG" />
    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    <uses-permission android:name="android.permission.READ_SMS" />
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />

    <!-- Screen Time & Usage Stats -->
    <uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" />

    <!-- Background Fused GPS -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />

    <!-- Wi-Fi Tethering & Network Stats -->
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />

    <application
        android:label="PhonePulse"
        android:theme="@style/Theme.PhonePulse">

        <!-- Notification Listener Service for WhatsApp / Insta Calls & Messages -->
        <service
            android:name=".services.AppNotificationListenerService"
            android:permission="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.service.notification.NotificationListenerService" />
            </intent-filter>
        </service>

        <!-- Call & SMS Broadcast Receiver -->
        <receiver
            android:name=".receivers.CallAndSmsReceiver"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.PHONE_STATE" />
                <action android:name="android.provider.Telephony.SMS_RECEIVED" />
                <action android:name="android.intent.action.PACKAGE_ADDED" />
                <data android:scheme="package" />
            </intent-filter>
        </receiver>

    </application>
</manifest>`,

    notification: `package com.phonepulse.tracker.services

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log

class AppNotificationListenerService : NotificationListenerService() {

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        sbn ?: return

        val packageName = sbn.packageName
        val extras = sbn.notification.extras
        val title = extras.getString("android.title") ?: ""
        val text = extras.getCharSequence("android.text")?.toString() ?: ""
        val timestamp = System.currentTimeMillis()

        when (packageName) {
            "com.whatsapp" -> {
                if (title.contains("call", ignoreCase = true) || text.contains("incoming", ignoreCase = true)) {
                    // Log WhatsApp VoIP Call
                    VaultDatabase.saveCallLog(
                        contact = title,
                        channel = "whatsapp",
                        type = "incoming",
                        time = timestamp
                    )
                } else {
                    // Log WhatsApp Chat Message preview
                    VaultDatabase.saveMessageLog(
                        sender = title,
                        preview = text,
                        source = "whatsapp",
                        time = timestamp
                    )
                }
            }
            "com.instagram.android" -> {
                VaultDatabase.saveMessageLog(
                    sender = title,
                    preview = text,
                    source = "instagram",
                    time = timestamp
                )
            }
        }
    }
}`,

    calls: `package com.phonepulse.tracker.receivers

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.telephony.TelephonyManager
import android.provider.Telephony

class CallAndSmsReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            TelephonyManager.ACTION_PHONE_STATE_CHANGED -> {
                val state = intent.getStringExtra(TelephonyManager.EXTRA_STATE)
                val incomingNumber = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER) ?: "Private"
                
                if (state == TelephonyManager.EXTRA_STATE_RINGING) {
                    VaultDatabase.recordCall(incomingNumber, "incoming_ringing")
                } else if (state == TelephonyManager.EXTRA_STATE_IDLE) {
                    VaultDatabase.finalizeCall(incomingNumber)
                }
            }
            Telephony.Sms.Intents.SMS_RECEIVED_ACTION -> {
                val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
                for (sms in messages) {
                    VaultDatabase.saveMessageLog(
                        sender = sms.originatingAddress ?: "Unknown",
                        preview = sms.messageBody ?: "",
                        source = "sms",
                        time = sms.timestampMillis
                    )
                }
            }
        }
    }
}`,

    sim: `package com.phonepulse.tracker.telephony

import android.content.Context
import android.telephony.SubscriptionManager
import android.telephony.TelephonyManager

class SimTelephonyMonitor(private val context: Context) {

    fun checkSimSerialStatus(onSimSwapped: (slot: Int, newIccid: String) -> Unit) {
        val subscriptionManager = context.getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE) as SubscriptionManager
        val activeSubscriptions = subscriptionManager.activeSubscriptionInfoList ?: return

        for (info in activeSubscriptions) {
            val slotIndex = info.simSlotIndex
            val currentIccid = info.iccId // Hardware SIM Serial Number
            val savedIccid = VaultDatabase.getSavedIccid(slotIndex)

            if (savedIccid != null && savedIccid != currentIccid) {
                // SIM Serial changed! Alert triggered
                onSimSwapped(slotIndex, currentIccid)
                VaultDatabase.recordSecurityAlert("SIM_SWAPPED", "Slot $slotIndex changed to $currentIccid")
            }
            VaultDatabase.saveIccid(slotIndex, currentIccid)
        }
    }
}`,

    location: `package com.phonepulse.tracker.location

import android.content.Context
import com.google.android.gms.location.*
import java.util.concurrent.TimeUnit

class LocationBackgroundTracker(private val context: Context) {
    private val fusedClient: FusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(context)

    fun startPeriodicTelemetry() {
        val request = LocationRequest.Builder(Priority.PRIORITY_BALANCED_POWER_ACCURACY, TimeUnit.MINUTES.toMillis(15))
            .setMinUpdateIntervalMillis(TimeUnit.MINUTES.toMillis(10))
            .build()

        val callback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                val loc = result.lastLocation ?: return
                VaultDatabase.saveLocationWaypoint(
                    lat = loc.latitude,
                    lng = loc.longitude,
                    accuracy = loc.accuracy,
                    speed = loc.speed * 3.6f // km/h
                )
            }
        }
        fusedClient.requestLocationUpdates(request, callback, context.mainLooper)
    }
}`,
  };

  const taskerXmlRecipe = `<!-- PhonePulse Tasker Macro Profile (Save as PhonePulse_Logger.prf.xml) -->
<TaskerData sr="" dvi="1" tv="6.2">
  <Profile sr="prof1" ve="2">
    <cdate>1792529000000</cdate>
    <edate>1792539000000</edate>
    <id>101</id>
    <mid0>201</mid0>
    <nme>PhonePulse_WhatsApp_Chat_Capture</nme>
    <Event sr="con0" ve="2">
      <code>461</code>
      <App sr="app0">
        <pkg>com.whatsapp</pkg>
      </App>
      <Str sr="arg0" ve="3"/>
      <Str sr="arg1" ve="3"/>
    </Event>
  </Profile>
  <Task sr="task201">
    <cdate>1792529000000</cdate>
    <id>201</id>
    <nme>Write_PhonePulse_Log</nme>
    <Action sr="act0" ve="7">
      <code>410</code>
      <Str sr="arg0" ve="3">PhonePulse/daily_logs.json</Str>
      <Str sr="arg1" ve="3">{"type":"message","source":"whatsapp","sender":"%ntitle","preview":"%ntext","time":"%TIME"}</Str>
      <Int sr="arg2" val="1"/>
      <Int sr="arg3" val="1"/>
    </Action>
  </Task>
</TaskerData>`;

  return (
    <div className="space-y-5">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-indigo-400 uppercase">
                Production Conversion Blueprint
              </span>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <span className="text-xs font-mono text-slate-400">
                Native Android Studio &amp; No-Code Tasker
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Real Phone Deployment &amp; Bridge Kit
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              To connect real phone telemetry (Calls, WhatsApp notifications, Hotspot tethering, SIM serial, and GPS), choose between a custom <strong>Android Studio (Kotlin)</strong> app or a <strong>No-Code (Tasker / MacroDroid)</strong> automation profile.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveApproach('importer')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-500/50 hover:bg-emerald-900/60 rounded-md transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Real Phone Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Approach Selector Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={() => setActiveApproach('kotlin')}
          className={`text-left p-4 rounded-lg border transition-all ${
            activeApproach === 'kotlin'
              ? 'bg-indigo-950/20 border-indigo-500 text-white'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Code2 className="w-5 h-5 text-indigo-400" />
            <span className="text-[11px] font-mono text-indigo-300">Option 1</span>
          </div>
          <div className="text-sm font-bold text-white">Android Studio &amp; Kotlin</div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Full native Android project with BroadcastReceivers, NotificationListenerService, and Room SQLite.
          </p>
        </button>

        <button
          onClick={() => setActiveApproach('tasker')}
          className={`text-left p-4 rounded-lg border transition-all ${
            activeApproach === 'tasker'
              ? 'bg-indigo-950/20 border-indigo-500 text-white'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Workflow className="w-5 h-5 text-amber-400" />
            <span className="text-[11px] font-mono text-amber-300">Option 2</span>
          </div>
          <div className="text-sm font-bold text-white">Tasker / MacroDroid (No-Code)</div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Zero coding required. Pre-built automation triggers that capture notifications and log directly into JSON.
          </p>
        </button>

        <button
          onClick={() => setActiveApproach('importer')}
          className={`text-left p-4 rounded-lg border transition-all ${
            activeApproach === 'importer'
              ? 'bg-indigo-950/20 border-indigo-500 text-white'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Upload className="w-5 h-5 text-emerald-400" />
            <span className="text-[11px] font-mono text-emerald-300">Instant Sync</span>
          </div>
          <div className="text-sm font-bold text-white">Import Device JSON / Backup</div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Paste exported Tasker JSON, SMS backup, or call records directly into this web vault right now.
          </p>
        </button>
      </div>

      {/* APPROACH 1: KOTLIN NATIVE */}
      {activeApproach === 'kotlin' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white">Native Android Source Code Blueprint</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Target: Android 15 (API 35) · Min SDK: 26 (Android 8.0+) · Language: Kotlin 2.0
              </p>
            </div>

            <button
              onClick={() => handleCopy(activeCodeFile, codeSnippets[activeCodeFile])}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-750 rounded-md transition-colors w-fit"
            >
              {copiedKey === activeCodeFile ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Snippet</span>
                </>
              )}
            </button>
          </div>

          {/* File selector tabs */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1">
            {[
              { id: 'manifest', label: 'AndroidManifest.xml' },
              { id: 'notification', label: 'AppNotificationListener.kt' },
              { id: 'calls', label: 'CallAndSmsReceiver.kt' },
              { id: 'sim', label: 'SimTelephonyMonitor.kt' },
              { id: 'location', label: 'LocationBackgroundTracker.kt' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveCodeFile(f.id as any)}
                className={`px-3 py-1.5 rounded font-mono whitespace-nowrap transition-colors ${
                  activeCodeFile === f.id
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-96 leading-relaxed">
              <code>{codeSnippets[activeCodeFile]}</code>
            </pre>
          </div>

          {/* ADB Permission Setup Instructions */}
          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>Privileged ADB Setup Commands (Run once on computer via USB):</span>
            </div>
            <p className="text-slate-400">
              Certain permissions like <code className="text-indigo-300 font-mono">PACKAGE_USAGE_STATS</code> and background location require system approval:
            </p>
            <div className="bg-slate-900 p-2.5 rounded font-mono text-[11px] text-emerald-300 space-y-1">
              <div>adb shell pm grant com.phonepulse.tracker android.permission.PACKAGE_USAGE_STATS</div>
              <div>adb shell pm grant com.phonepulse.tracker android.permission.ACCESS_BACKGROUND_LOCATION</div>
              <div>adb shell pm grant com.phonepulse.tracker android.permission.READ_PHONE_STATE</div>
            </div>
          </div>
        </div>
      )}

      {/* APPROACH 2: TASKER / MACRODROID NO-CODE */}
      {activeApproach === 'tasker' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white">No-Code Automation Setup (Tasker &amp; MacroDroid)</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automate phone telemetry collection without setting up Android Studio or writing Kotlin code
              </p>
            </div>

            <button
              onClick={() => handleCopy('tasker_xml', taskerXmlRecipe)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-750 rounded-md transition-colors w-fit"
            >
              {copiedKey === 'tasker_xml' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied Tasker XML</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Tasker Profile</span>
                </>
              )}
            </button>
          </div>

          {/* 3 Step No-Code Guide */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 space-y-2">
              <div className="font-bold text-amber-400 font-mono text-sm">Step 1</div>
              <div className="font-semibold text-white">Install Tasker or MacroDroid</div>
              <p className="text-slate-400 leading-relaxed">
                Download Tasker or MacroDroid from Google Play Store on your Android device. Grant standard Notification Access &amp; Phone State when prompted.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 space-y-2">
              <div className="font-bold text-amber-400 font-mono text-sm">Step 2</div>
              <div className="font-semibold text-white">Import Profile or Set Triggers</div>
              <p className="text-slate-400 leading-relaxed">
                In Tasker, import the XML profile below, or create 2 simple macros:
                <br />• Trigger: <strong>Notification Received</strong> (WhatsApp)
                <br />• Action: <strong>Write File</strong> (<code className="text-slate-300 font-mono">PhonePulse/logs.json</code>)
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 space-y-2">
              <div className="font-bold text-amber-400 font-mono text-sm">Step 3</div>
              <div className="font-semibold text-white">Sync with Dashboard</div>
              <p className="text-slate-400 leading-relaxed">
                Tasker automatically updates the JSON log file whenever a call, SMS, or WhatsApp notification arrives. You can import that file directly in the next tab!
              </p>
            </div>
          </div>

          {/* Tasker XML Blueprint */}
          <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
            <div className="p-2.5 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex justify-between">
              <span>PhonePulse_Tasker_Profile.prf.xml</span>
              <span>Importable into Tasker Profile Tab</span>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-64 leading-relaxed">
              <code>{taskerXmlRecipe}</code>
            </pre>
          </div>
        </div>
      )}

      {/* APPROACH 3: REAL DATA IMPORTER */}
      {activeApproach === 'importer' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white">Import Real Phone Logs Into Vault</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Paste JSON telemetry exported from your phone, Tasker macro, or SMS backup tool.
            </p>
          </div>

          {importStatus && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center justify-between border ${
                importStatus.success
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
              }`}
            >
              <span>{importStatus.message}</span>
              {importStatus.success && <Check className="w-4 h-4 text-emerald-400" />}
            </div>
          )}

          <form onSubmit={handleImportSubmit} className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <label className="text-slate-300 font-medium">Paste JSON Log Payload</label>
                <button
                  type="button"
                  onClick={() => setImportJsonText(sampleJsonTemplate)}
                  className="text-indigo-400 hover:text-indigo-300 font-mono text-[11px]"
                >
                  Load Sample Real Data Payload
                </button>
              </div>
              <textarea
                rows={8}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder={sampleJsonTemplate}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500 font-mono">
                Supports arrays: <code className="text-slate-400">calls</code>, <code className="text-slate-400">messages</code>, <code className="text-slate-400">waypoints</code>, <code className="text-slate-400">timeline</code>
              </span>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors"
              >
                Import Into Dashboard Vault
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
