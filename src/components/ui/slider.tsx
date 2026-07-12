// src/components/ui/slider.tsx
"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-gray-100">
      <SliderPrimitive.Range className="absolute h-full bg-[#8A8A8A]" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-[#8A8A8A] bg-[#8A8A8A] shadow-lg transition-colors focus:outline-none  focus:ring-blue-500 focus:ring-offset-2" />
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-[#8A8A8A] bg-[#8A8A8A] shadow-lg transition-colors focus:outline-none  focus:ring-blue-500 focus:ring-offset-2" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }