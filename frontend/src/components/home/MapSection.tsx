"use client";
import {Building2,Phone, Mail,} from "lucide-react";
import {FaFacebookF,FaYoutube,} from "react-icons/fa";
import { useSiteSettings } from "@/src/hooks/useSiteSettings";
import { contactData } from "@/src/constants/contact";


export default function MapSection() {
   const { settings } =useSiteSettings();
  const email =settings?.email|| contactData.email
  const phone =settings?.phone ||contactData.phone;
  const address = settings?.office_address||contactData.address
  return (
    <section
      className="py-24"
      style={{
        background:
          "linear-gradient(135deg,var(--primary-dark),var(--primary))",
      }}
    >
      <div className="container-custom">
        <div
  className="
    grid
    lg:grid-cols-2
    gap-10
    items-stretch
  "
>
          {/* Contact Card */}
          <div
  className="
    animate-fade-up
    rounded-3xl
    p-8
    md:p-10
    shadow-2xl
    h-full
  "
            style={{
              background: "var(--bg-light)",
            }}
          >
            <h2
              className="
                text-3xl
                md:text-4xl
                font-bold
                mb-8
              "
              style={{
                color: "var(--primary-dark)",
              }}
            >
              {contactData.heading}
            </h2>

            <div
              className="mb-8"
              style={{
                borderBottom:
                  "1px solid var(--accent)",
              }}
            />

            {/* Address */}
            <div className="flex gap-5 mb-8">
              <div
                className="
                  w-14
                  h-14
                  rounded-full
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
                style={{
                  background: "var(--primary)",
                }}
              >
                <Building2
                  size={24}
                  color="white"
                />
              </div>

              <div>
                <h3
                  className="font-bold text-lg"
                  style={{
                    color: "var(--primary-dark)",
                  }}
                >
                  অফিসের ঠিকানা
                </h3>

                <p
                  className="mt-1 leading-7"
                  style={{
                    color: "var(--text-dark)",
                  }}
                >
                  {address}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-5 mb-8">
              <div
                className="
                  w-14
                  h-14
                  rounded-full
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
                style={{
                  background: "var(--primary)",
                }}
              >
                <Phone
                  size={24}
                  color="white"
                />
              </div>

              <div>
                <h3
                  className="font-bold text-lg"
                  style={{
                    color: "var(--primary-dark)",
                  }}
                >
                  ফোন করুন
                </h3>

                <a
                  href={`tel:${phone}`}
                  className="
                    block
                    mt-1
                    transition-all
                    duration-300
                    hover:opacity-70
                  "
                  style={{
                    color: "var(--text-dark)",
                  }}
                >
                  {phone}
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-5">
              <div
                className="
                  w-14
                  h-14
                  rounded-full
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
                style={{
                  background: "var(--primary)",
                }}
              >
                <Mail
                  size={24}
                  color="white"
                />
              </div>

              <div>
                <h3
                  className="font-bold text-lg"
                  style={{
                    color: "var(--primary-dark)",
                  }}
                >
                  ইমেইল করুন
                </h3>

                <a
                  href={`mailto:${email}`}
                  className="
                    block
                    mt-1
                    transition-all
                    duration-300
                    hover:opacity-70
                  "
                  style={{
                    color: "var(--text-dark)",
                  }}
                >
                  {email}
                </a>
              </div>
            </div>
            
          </div>

          {/* Google Map */}
          <div
  className="
    animate-fade-up
    rounded-3xl
    overflow-hidden
    shadow-2xl
    h-full
    min-h-[500px]
  "
>
  <iframe
    src={contactData.mapEmbedUrl}
    loading="lazy"
    allowFullScreen
    referrerPolicy="no-referrer-when-downgrade"
    className="w-full h-full border-0"
  />
</div>
        </div>
      </div>
    </section>
  );
}