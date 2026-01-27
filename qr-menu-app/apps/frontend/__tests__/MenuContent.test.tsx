import { render, screen } from "@testing-library/react";
import MenuContent from "@/app/menu/[slug]/components/MenuContent";
import LanguageProvider from "@/app/menu/[slug]/components/LanguageProvider";

const categories = [
  {
    id: "cat-1",
    name: "Coffee",
    translations: { tr: { name: "Kahve" } },
  },
];

const products = [
  {
    id: "prod-1",
    name: "Latte",
    description: "Milk coffee",
    price: 4.5,
    category: { id: "cat-1", name: "Coffee" },
    translations: { tr: { name: "Latte", description: "Sütlü kahve" } },
  },
];

describe("MenuContent", () => {
  it("renders translated content when language is available", () => {
    render(
      <LanguageProvider defaultLanguage="en" availableLanguages={["en", "tr"]}>
        <MenuContent categories={categories} products={products} />
      </LanguageProvider>
    );

    expect(screen.getByText("Kahve")).toBeInTheDocument();
    expect(screen.getByText("Sütlü kahve")).toBeInTheDocument();
  });
});
