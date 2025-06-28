import { Link } from "react-router";

export default function SidebarWidget() {
  return (
    <div
      className={`
        mx-auto mb-10 w-full max-w-60 rounded-2xl bg-background px-4 py-5 text-center`}
    >
      <h3 className="mb-2 font-semibold text-foreground">
        #1 StyloPay Admin
      </h3>
      <p className="mb-4 text-foreground text-theme-sm">
        Leading StyloPay Admin Template with 400+ UI Component and Pages.
      </p>
      <Link
        to="#"
        className="flex items-center justify-center p-3 font-medium text-primary-foreground rounded-lg bg-primary text-theme-sm hover:bg-primary/90"
      >
        Purchase Plan
      </Link>
    </div>
  );
}
