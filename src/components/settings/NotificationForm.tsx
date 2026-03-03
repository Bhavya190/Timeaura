import { useEffect, FormEvent, useState, ChangeEvent } from "react";
import { NotificationPayload } from "@/lib/settings";
import { updateAdminNotificationsAction } from "@/app/actions";
import { useUser } from "@/components/UserProvider";
import { toast } from "react-hot-toast";

export default function NotificationForm() {
  const { user, refreshUser } = useUser();
  const [form, setForm] = useState<NotificationPayload>({
    email: user?.emailNotifications ?? true,
    weeklyReport: user?.weeklyReport ?? false,
    securityAlerts: user?.securityAlerts ?? true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        email: user.emailNotifications ?? true,
        weeklyReport: user.weeklyReport ?? false,
        securityAlerts: user.securityAlerts ?? true,
      });
    }
  }, [user]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: checked }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      await updateAdminNotificationsAction(user.id, {
        emailNotifications: form.email,
        weeklyReport: form.weeklyReport,
        securityAlerts: form.securityAlerts,
      });
      await refreshUser();
      toast.success("Notification preferences saved.");
    } catch (err: any) {
      toast.error(err.message || "Failed to update notifications");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-3">
        <ToggleRow
          label="Email notifications"
          description="Receive important updates and announcements."
          name="email"
          checked={form.email}
          onChange={handleChange}
        />
        <ToggleRow
          label="Weekly report"
          description="Get a weekly summary of time and tasks."
          name="weeklyReport"
          checked={form.weeklyReport}
          onChange={handleChange}
        />
        <ToggleRow
          label="Security alerts"
          description="Be notified about sign-ins and security events."
          name="securityAlerts"
          checked={form.securityAlerts}
          onChange={handleChange}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm hover:bg-emerald-400 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}

type ToggleRowProps = {
  label: string;
  description: string;
  name: keyof NotificationPayload;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

function ToggleRow({
  label,
  description,
  name,
  checked,
  onChange,
}: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-background/60 px-3 py-2.5">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>

      <label className="relative inline-flex items-center cursor-pointer">
        <span className="sr-only">{label}</span>

        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />

        <div
          className="
            w-9 h-5
            bg-muted
            rounded-full
            transition-colors
            peer-checked:bg-emerald-500
            relative
            after:content-['']
            after:absolute
            after:top-[2px]
            after:left-[2px]
            after:h-4
            after:w-4
            after:rounded-full
            after:bg-background
            after:shadow
            after:transition-all
            peer-checked:after:translate-x-4
          "
        />
      </label>
    </div>
  );
}
