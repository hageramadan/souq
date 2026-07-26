// app/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { AdsHome } from "@/components/home/AdsHome";
import { BestProducts } from "@/components/home/BestProducts";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { LatestProducts } from "@/components/home/LatestProducts";
import { BestDiscounts } from "@/components/home/BestDiscounts";
import { Hero } from "@/components/home/HeroCover";
import { LeastPriceProducts } from "@/components/home/LeastPrice";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState({
    hero: false,
    categories: false,
    bestProducts: false,
    latestProducts: false,
    ads: false,
    bestDiscounts: false,
    leastPrice: false,
  });

  // التحقق من تحميل كل البيانات
  useEffect(() => {
    const allLoaded = Object.values(dataLoaded).every(value => value === true);
    
    if (allLoaded) {
      console.log("✅ All components loaded!");
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }, [dataLoaded]);

  // دوال لتحديث حالة تحميل كل كمبوننت
  const handleHeroLoad = useCallback(() => {
    setDataLoaded(prev => ({ ...prev, hero: true }));
  }, []);

  const handleCategoriesLoad = useCallback(() => {
    setDataLoaded(prev => ({ ...prev, categories: true }));
  }, []);

  const handleBestProductsLoad = useCallback(() => {
    setDataLoaded(prev => ({ ...prev, bestProducts: true }));
  }, []);

  const handleLatestProductsLoad = useCallback(() => {
    setDataLoaded(prev => ({ ...prev, latestProducts: true }));
  }, []);

  const handleAdsLoad = useCallback(() => {
    setDataLoaded(prev => ({ ...prev, ads: true }));
  }, []);

  const handleBestDiscountsLoad = useCallback(() => {
    setDataLoaded(prev => ({ ...prev, bestDiscounts: true }));
  }, []);

  const handleLeastPriceLoad = useCallback(() => {
    setDataLoaded(prev => ({ ...prev, leastPrice: true }));
  }, []);

  return (
    <>
      {isLoading && <LoadingScreen />}
      
      <div className={isLoading ? "opacity-0" : "opacity-100 transition-opacity duration-500"}>
        <Hero onLoad={handleHeroLoad} />
        <CategoriesSection onLoad={handleCategoriesLoad} />
        <BestProducts onLoad={handleBestProductsLoad} />
        <LatestProducts onLoad={handleLatestProductsLoad} />
        <AdsHome onLoad={handleAdsLoad} />
        <BestDiscounts onLoad={handleBestDiscountsLoad} />
        <LeastPriceProducts onLoad={handleLeastPriceLoad} />
      </div>
    </>
  );
}