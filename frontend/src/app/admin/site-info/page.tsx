import LogoSettingsForm from "@/src/components/admin/LogoSettingsForm";
import SeoSettingsForm from "@/src/components/admin/SeoSettingsForm";

export default function AdminSiteInfoPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Site Info</h1>
        <p className="mt-2 text-gray-600">
          Manage the logo, header phone number, and SEO settings used across
          the website.
        </p>
      </div>

      <LogoSettingsForm />
      <SeoSettingsForm />
    </div>
  );
}
