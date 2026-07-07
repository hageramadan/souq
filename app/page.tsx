// app/page.tsx

import { AdsHome } from "@/components/home/AdsHome";
import { BestProducts } from "@/components/home/BestProducts";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { LatestProducts } from "@/components/home/LatestProducts";
import { BestDiscounts } from "@/components/home/BestDiscounts";
import { Hero } from "@/components/home/HeroCover";
import { LeastPriceProducts } from "@/components/home/LeastPrice";

export default async function Home() {
  return (
    <div>
      <Hero /> 
      <CategoriesSection />  
      <BestProducts />
      <LatestProducts />
      <AdsHome />
      <BestDiscounts />
      <LeastPriceProducts />
    </div>
  );
}