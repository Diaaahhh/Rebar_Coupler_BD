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
        <div
        className="border-t py-6 px-4 text-center space-y-3"
        style={{ borderColor: "#5A6869" }}
      >
        {/* Row 1 */}
        <p className="text-sm">
  Copyright © {new Date().getFullYear()} All rights reserved by{" "}
  <a
    href="https://iglgroup.org"
    target="_blank"
    rel="noopener noreferrer"
    className="font-bold text-white"
  >
    IGL Group
  </a>
</p>

        {/* Row 2 */}
        <p className="text-xs text-white">
  <a
    href="https://iglweb.com/web/domains-services.php"
    target="_blank"
    rel="noopener noreferrer"
    className="text-white"
  >
    Domain Registration by:
  </a>{" "}
  <a
    href="https://iglweb.com/web/domains-services.php"
    target="_blank"
    rel="noopener noreferrer"
    className="text-white"
  >
    IGL Web Ltd.
  </a>
  {" | "}
  <a
    href="https://iglweb.com/web/hosting-regular-shared.php"
    target="_blank"
    rel="noopener noreferrer"
    className="text-white"
  >
    Web Hosting by:
  </a>{" "}
  <a
    href="https://iglweb.com/web/hosting-regular-shared.php"
    target="_blank"
    rel="noopener noreferrer"
    className="text-white"
  >
    IGL Web Ltd.
  </a>
  {" | "}
  <a
    href="https://iglweb.com/web/web-development.php"
    target="_blank"
    rel="noopener noreferrer"
    className="text-white"
  >
    Web Design & Development by:
  </a>{" "}
  <a
    href="https://iglweb.com/web/web-development.php"
    target="_blank"
    rel="noopener noreferrer"
    className="text-white"
  >
    IGL Web Ltd.
  </a>
</p>
      </div>
      </div>
    </footer>
  );
}