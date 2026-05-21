"use client";

import { useEffect } from "react";

/**
 * Tags <body> with `data-operator-theme="true"` while any operator route is
 * mounted. Radix overlays (Dialog / Select / Popover / DropdownMenu) portal
 * their content to document.body — OUTSIDE the `.theme-operator` wrapper — so
 * without this they'd inherit the neutral :root palette and look off-brand
 * against the cream/coral page behind them. The matching
 * `body[data-operator-theme="true"]` selector in globals.css remaps the same
 * token set onto <body>, so portalled surfaces pick up the operator palette.
 *
 * In-tree page content is already covered by `.theme-operator` on the group
 * layout wrapper (SSR-correct, no flash); this only patches the portal case,
 * and overlays are post-interaction so a useEffect toggle is sufficient.
 */
export function OperatorThemeBody() {
  useEffect(() => {
    document.body.dataset.operatorTheme = "true";
    return () => {
      delete document.body.dataset.operatorTheme;
    };
  }, []);

  return null;
}
