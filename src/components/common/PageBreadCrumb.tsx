import { Link } from "react-router";
import { useTranslation } from "react-i18next";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbAliasItem {
  label: string;
  link?: string;
  path?: string;
  href?: string;
}

interface BreadcrumbProps {
  pageTitle: string;
  hideTitle?: boolean;
  breadcrumbItems?: BreadcrumbItem[];
  items?: BreadcrumbAliasItem[];
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle, hideTitle = false, breadcrumbItems, items: aliasItems }) => {
  const { t } = useTranslation();
  const normalizedItems: BreadcrumbItem[] | undefined =
    breadcrumbItems ??
    aliasItems?.map((i) => ({ label: i.label, href: i.href ?? i.link ?? i.path }));
  const items: BreadcrumbItem[] = [
    { label: t("nav.home"), href: "/" },
    ...(normalizedItems && normalizedItems.length > 0
      ? normalizedItems
      : [{ label: pageTitle }]),
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      {!hideTitle && <h1
        className="text-2xl font-semibold tracking-tight text-fg md:text-3xl"
      >
        {pageTitle}
      </h1>}
      <nav aria-label={t("rbac.breadcrumb.label")}>
        <ol className="flex flex-wrap items-center gap-1.5">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={`${item.label}-${index}`} className="flex flex-wrap items-center gap-1.5">
                {item.href && !isLast ? (
                  <Link
                    className="inline-flex items-center gap-1.5 text-sm text-fg-muted dark:text-fg-muted"
                    to={item.href}
                  >
                    {item.label}
                    <svg
                      className="stroke-current rtl:rotate-180"
                      width="17"
                      height="16"
                      viewBox="0 0 17 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                        stroke=""
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                ) : (
                  <span className={`text-sm ${isLast ? "text-fg dark:text-fg" : "text-fg-muted dark:text-fg-muted"}`}>
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

export default PageBreadcrumb;
