import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <>
      <PageMeta
        title={t('notFound.metaTitle')}
        description={t('notFound.metaDescription')}
      />
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
        <GridShape />
        <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
          <h1 className="mb-8 font-bold text-fg text-title-md dark:text-fg xl:text-title-2xl">
            {t('notFound.error')}
          </h1>

          <img src="/images/error/404.svg" alt="404" className="dark:hidden" />
          <img
            src="/images/error/404-dark.svg"
            alt="404"
            className="hidden dark:block"
          />

          <p className="mt-10 mb-6 text-base text-fg dark:text-fg-muted sm:text-lg">
            {t('notFound.message')}
          </p>

          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-5 py-3.5 text-sm font-medium text-fg shadow-theme-xs hover:bg-bg hover:text-fg dark:border-line dark:bg-surface dark:text-fg-muted dark:hover:bg-white/[0.03]"
          >
            {t('notFound.backHome')}
          </Link>
        </div>
        {/* <!-- Footer --> */}
        <p className="absolute text-sm text-center text-fg-muted -translate-x-1/2 rtl:translate-x-1/2 bottom-6 start-1/2 dark:text-fg-muted">
          &copy; {new Date().getFullYear()} - TailAdmin
        </p>
      </div>
    </>
  );
}
