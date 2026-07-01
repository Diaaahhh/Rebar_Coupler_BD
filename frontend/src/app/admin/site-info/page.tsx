import LogoSettingsForm from "@/src/components/admin/LogoSettingsForm";
import SeoSettingsForm from "@/src/components/admin/SeoSettingsForm";
import HeroSettingsForm from "@/src/components/admin/HeroSettingsForm";
import BenefitSettingsForm from "@/src/components/admin/BenefitSettingsForm";
import AboutSettingsForm from "@/src/components/admin/AboutSettingsForm";
import FAQSettingsForm from "@/src/components/admin/FAQSettingsForm";
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
      <HeroSettingsForm />
      <BenefitSettingsForm/>
      <AboutSettingsForm/>
      <FAQSettingsForm />
    </div>
  );
}
