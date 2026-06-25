import Link from "next/link";
import { siteData } from "@/src/constants/site";

export default function Footer() {
  return (
    <footer
      className="mt-auto border-t"
      style={{
        borderColor: "var(--primary-light)",
        background:
          "linear-gradient(to right, var(--primary-dark), var(--primary))",
      }}
    >
      <div className="container-custom">
        <div className="py-5">
          <p
            className="
              text-center
              text-sm
              md:text-base
              font-medium
              leading-relaxed
            "
            style={{
              color: "var(--text-light)",
            }}
          >
            Copyright © {new Date().getFullYear()}{" "}
            <span className="font-semibold">
              {siteData.companyName}
            </span>
            {" | "}
            Powered by{" "}
            <Link
              href="https://iglweb.com/web/"
              target="_blank"
              className="
                font-semibold
                transition-all
                duration-300
                hover:opacity-80
              "
              style={{
                color: "var(--accent-hover)",
              }}
            >
              {siteData.poweredBy}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}