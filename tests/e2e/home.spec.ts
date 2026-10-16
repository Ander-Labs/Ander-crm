import { expect, test } from "@playwright/test";

test("unauthenticated operators are redirected to the private login", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Acceso interno" })).toBeVisible();
});
